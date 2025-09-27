package S13P21A305.dgg.route.service;

import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.fatigue.service.FatigueService;
import S13P21A305.dgg.global.external.dto.OdSayResponseDTO;
import S13P21A305.dgg.global.external.service.GeocodingService;
import S13P21A305.dgg.global.external.service.OdsayClient;
import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.repository.MemberRepository;
import S13P21A305.dgg.route.domain.RoutePayload;
import S13P21A305.dgg.route.dto.RecommendedRouteDTO;
import S13P21A305.dgg.route.dto.RouteDetailDTO;
import S13P21A305.dgg.route.dto.RouteRequestDTO;
import S13P21A305.dgg.route.dto.RouteResponseDTO;
import S13P21A305.dgg.route.dto.StationCoordDTO;
import S13P21A305.dgg.route.entity.RouteInfo;
import S13P21A305.dgg.route.entity.RouteLog;
import S13P21A305.dgg.route.entity.RouteType;
import S13P21A305.dgg.route.repository.RouteInfoRepository;
import S13P21A305.dgg.route.repository.RouteLogRepository;
import S13P21A305.dgg.route.util.RouteKeyUtil;
import S13P21A305.dgg.waypoint.dto.LatLon;
import S13P21A305.dgg.waypoint.dto.TopCandidateDto;
import S13P21A305.dgg.waypoint.service.WaypointService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;

@RequiredArgsConstructor
@Service
@Slf4j
public class RouteServiceImpl implements RouteService {

	private final RestTemplate restTemplate;
	private final GeocodingService geocodingService;
	private final RouteCacheService cache;

	private final RouteLogRepository routeLogRepository;
	private final RouteInfoRepository routeInfoRepository;
	private final MemberRepository memberRepository;

	private final OdsayClient odsayClient;
	private final FatigueService fatigueService;
	private final WaypointService waypointService;

	@Value("${odsay.api.key}")
	private String odsayApiKey;

	private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	/**
	 * 출발지 - 경유지 - 도착지 사이를 구간별로 ODSay 검색
	 * - 최단거리, 최소환승, 최소피로에 대한 요약 생성
	 * - 캐시에 요약 + 메타 저장
	 */
	@Override
	public RouteResponseDTO findRoute(RouteRequestDTO routeRequestDTO) {
		List<String> waypoints = new ArrayList<>();
		waypoints.add(routeRequestDTO.getDepartureAddress());
		if (routeRequestDTO.getStopoverAddresses() != null && !routeRequestDTO.getStopoverAddresses().isEmpty()) {
			waypoints.addAll(routeRequestDTO.getStopoverAddresses());
		}
		waypoints.add(routeRequestDTO.getDestinationAddress());

		LocalDateTime depTime = LocalDateTime.parse(routeRequestDTO.getStartTime(), FMT); // 출발시각

		// ===== (1) 시간/도착시각 계산 (요약용) =====
		int shortestMinutes = calculateTotalMetric(waypoints, this::findShortestDistancePathSegment, p -> p.getInfo().getTotalTime());
		String shortestArrival = depTime.plusMinutes(shortestMinutes).format(FMT);

		int minTransferMinutes = calculateTotalMetric(waypoints, this::findMinTransferPathSegment, p -> p.getInfo().getTotalTime());
		String minTransferArrival = depTime.plusMinutes(minTransferMinutes).format(FMT);

		String shortestId = RouteKeyUtil.makeRouteId(
			routeRequestDTO.getDepartureAddress(),
			routeRequestDTO.getDestinationAddress(),
			"SHORTEST",
			routeRequestDTO.getStartTime()
		);
		String minTransferId = RouteKeyUtil.makeRouteId(
			routeRequestDTO.getDepartureAddress(),
			routeRequestDTO.getDestinationAddress(),
			"MIN_TRANSFER",
			routeRequestDTO.getStartTime()
		);

		RecommendedRouteDTO shortest = RecommendedRouteDTO.builder()
			.routeKey(shortestId).name("최단 경로")
			.timeTaken(shortestMinutes).arrivalTime(shortestArrival)
			.fatigue(0) // 아래에서 실제 피로도로 대체
			.build();

		RecommendedRouteDTO minTransfer = RecommendedRouteDTO.builder()
			.routeKey(minTransferId).name("최소 환승")
			.timeTaken(minTransferMinutes).arrivalTime(minTransferArrival)
			.fatigue(0) // 아래에서 실제 피로도로 대체
			.build();

		// ===== (2) 최단/최소환승의 실제 피로도 계산 =====
		try {
			Point depPt  = geocodingService.getCoordinates(routeRequestDTO.getDepartureAddress());
			Point destPt = geocodingService.getCoordinates(routeRequestDTO.getDestinationAddress());
			if (depPt != null && destPt != null) {
				List<OdSayResponseDTO.Path> cand = findPathsBetweenCoords(depPt.lon(), depPt.lat(), destPt.lon(), destPt.lat());

				// 최단 경로
				try {
					OdSayResponseDTO.Path chosen = findShortestDistancePathSegment(cand);
					List<RoutePayload> payload = mapPathsToPayloads(List.of(chosen));
					double score = fatigueService.calculateFatigueFromPayload(null, payload);
					shortest.setFatigue((int)Math.round(score));
				} catch (Exception e) {
					log.warn("[fatigue] 최단 경로 피로도 계산 실패, 기본값 사용: {}", e.toString());
					shortest.setFatigue(75);
				}

				// 최소 환승
				try {
					OdSayResponseDTO.Path chosen = findMinTransferPathSegment(cand);
					List<RoutePayload> payload = mapPathsToPayloads(List.of(chosen));
					double score = fatigueService.calculateFatigueFromPayload(null, payload);
					minTransfer.setFatigue((int)Math.round(score));
				} catch (Exception e) {
					log.warn("[fatigue] 최소 환승 피로도 계산 실패, 기본값 사용: {}", e.toString());
					minTransfer.setFatigue(60);
				}
			} else {
				// 지오코딩 실패 시 폴백
				shortest.setFatigue(75);
				minTransfer.setFatigue(60);
			}
		} catch (Exception e) {
			log.warn("[fatigue] 요약 피로도 계산 중 예외, 기본값 사용: {}", e.toString());
			shortest.setFatigue(75);
			minTransfer.setFatigue(60);
		}

		// ===== (3) 캐시 저장(요약 + 메타) =====
		cache.saveSummary(shortestId, shortest);
		cache.saveSummary(minTransferId, minTransfer);
		cache.saveMeta(shortestId, new RouteMeta(
			routeRequestDTO.getDepartureAddress(),
			routeRequestDTO.getDestinationAddress(),
			routeRequestDTO.getStopoverAddresses(),
			routeRequestDTO.getStartTime(),
			"SHORTEST"
		));
		cache.saveMeta(minTransferId, new RouteMeta(
			routeRequestDTO.getDepartureAddress(),
			routeRequestDTO.getDestinationAddress(),
			routeRequestDTO.getStopoverAddresses(),
			routeRequestDTO.getStartTime(),
			"MIN_TRANSFER"
		));

		String representativeArrival = shortestMinutes <= minTransferMinutes ? shortestArrival : minTransferArrival;

		// ===== (4) 최소 피로도 경로(경유 후보 기반) =====
		RecommendedRouteDTO minFatigue = computeMinFatigueRoute(routeRequestDTO);

		return RouteResponseDTO.builder()
			.departureAddress(routeRequestDTO.getDepartureAddress())
			.destinationAddress(routeRequestDTO.getDestinationAddress())
			.stopoverAddresses(routeRequestDTO.getStopoverAddresses())
			.departureTime(routeRequestDTO.getStartTime())
			.destinationTime(representativeArrival)
			.recommendedRoutes(List.of(minFatigue, shortest, minTransfer))
			.build();
	}

	/** routeKey로 요약 복구 (실제 피로도 재계산 포함) */
	@Override
	public RecommendedRouteDTO getSummary(String routeKey) {
		RecommendedRouteDTO s = cache.getSummary(routeKey, RecommendedRouteDTO.class);
		if (s != null) return s;

		RouteMeta meta = cache.getMeta(routeKey, RouteMeta.class);
		if (meta == null) return null;

		List<String> waypoints = new ArrayList<>();
		waypoints.add(meta.departure);
		if (meta.stopovers != null && !meta.stopovers.isEmpty()) waypoints.addAll(meta.stopovers);
		waypoints.add(meta.destination);

		Function<List<OdSayResponseDTO.Path>, OdSayResponseDTO.Path> selector =
			"MIN_TRANSFER".equals(meta.option)
				? this::findMinTransferPathSegment
				: this::findShortestDistancePathSegment;

		int minutes = calculateTotalMetric(waypoints, selector, p -> p.getInfo().getTotalTime());
		String arrival = LocalDateTime.parse(meta.departureTime, FMT).plusMinutes(minutes).format(FMT);

		// 실제 피로도 재계산
		int fatigue;
		try {
			List<OdSayResponseDTO.Path> cand = findPathsBetween(meta.departure, meta.destination);
			OdSayResponseDTO.Path chosen = selector.apply(cand);
			List<RoutePayload> payload = mapPathsToPayloads(List.of(chosen));
			double score = fatigueService.calculateFatigueFromPayload(null, payload);
			fatigue = (int)Math.round(score);
		} catch (Exception e) {
			log.warn("[fatigue] getSummary 재계산 실패, 기본값 사용: {}", e.toString());
			fatigue = "MIN_TRANSFER".equals(meta.option) ? 60 : 75;
		}

		RecommendedRouteDTO rebuilt = RecommendedRouteDTO.builder()
			.routeKey(routeKey)
			.name("MIN_TRANSFER".equals(meta.option) ? "최소 환승" : "최단 경로")
			.timeTaken(minutes)
			.arrivalTime(arrival)
			.fatigue(fatigue)
			.build();

		cache.saveSummary(routeKey, rebuilt);
		return rebuilt;
	}

	/**
	 * DB의 route_log, route_info로 상세경로 만들고,
	 * 레그마다 정류장 리스트(passStopList)를 ODSay 다시 호출해서 복구,
	 * loadLane(mapObj) 써서 폴리라인 생성 - 시작/끝으로 조립 - 부족하면 보강
	 */
	@Override
	@Transactional(readOnly = true)
	public RouteDetailDTO getDetail(Long routeId, Integer memberId) {
		RouteLog log = routeLogRepository.findById(routeId)
			.orElseThrow(() -> new NoSuchElementException("경로를 찾을 수 없습니다."));

		if (memberId != null && log.getMember() != null &&
			!Objects.equals(log.getMember().getId(), memberId)) {
			throw new SecurityException("권한이 없습니다.");
		}

		List<RouteInfo> infos = routeInfoRepository.findAllByRouteIdOrderByOrder(routeId);
		List<RouteDetailDTO.Leg> legs = new ArrayList<>();
		for (RouteInfo ri : infos) {
			RouteDetailDTO.Leg leg = RouteDetailDTO.Leg.builder()
				.order(ri.getOrder())
				.type(ri.getType().name())
				.lineName(ri.getLineName())
				.timeTaken(ri.getTimeTaken())
				.startPoint(ri.getDeparture())
				.endPoint(ri.getDestination())
				.startLat(ri.getStartLat())
				.startLng(ri.getStartLng())
				.endLat(ri.getEndLat())
				.endLng(ri.getEndLng())
				.build();

			// path_json이 없어도 ODsay로 passStopList 재조회
			List<RouteDetailDTO.PathNodeDTO> pathNodes = reconstructPathForLeg(leg);
			leg.setPath(pathNodes);

			// 폴리라인 생성
			List<RouteDetailDTO.PolylinePointDTO> pl = buildPolylineForDetailLeg(leg);
			leg.setPolyline(pl);

			legs.add(leg);
		}

		Integer minutes = (log.getTimeTaken() != null ? log.getTimeTaken() : log.getPredictedTime());
		String dep = log.getStartedAt() != null ? log.getStartedAt().format(FMT) : null;
		String arr = (log.getStartedAt() != null && minutes != null) ? log.getStartedAt().plusMinutes(minutes).format(FMT) : null;

		return RouteDetailDTO.builder()
			.totalTime(minutes != null ? minutes : 0)
			.departureTime(dep)
			.arrivalTime(arr)
			.fatigue(log.getPredictedFatigue() != null ? log.getPredictedFatigue() : 0)
			.data(legs)
			.build();
	}

	/**
	 * 출발 - 경유 - 도착을 구간별로 쪼개서, 매 구간마다 ODSay 경로 후보 가져오고,
	 * 선택 규칙으로 최적 path 하나 고르기 → metric 합산
	 */
	private int calculateTotalMetric(List<String> waypoints,
		Function<List<OdSayResponseDTO.Path>, OdSayResponseDTO.Path> pathSelector,
		Function<OdSayResponseDTO.Path, Integer> metricExtractor) {
		int total = 0;
		for (int i = 0; i < waypoints.size() - 1; i++) {
			List<OdSayResponseDTO.Path> paths = findPathsBetween(waypoints.get(i), waypoints.get(i + 1));
			OdSayResponseDTO.Path selected = pathSelector.apply(paths);
			total += metricExtractor.apply(selected);
		}
		return total;
	}

	/** 주소 → 좌표 → ODsay 호출 */
	private List<OdSayResponseDTO.Path> findPathsBetween(String startAddress, String endAddress) {
		Point startPoint = geocodingService.getCoordinates(startAddress);
		Point endPoint   = geocodingService.getCoordinates(endAddress);

		if (startPoint == null || endPoint == null) {
			throw new IllegalStateException("지오코딩 실패 - 주소를 좌표로 변환하지 못했습니다.");
		}
		return findPathsBetweenCoords(startPoint.lon(), startPoint.lat(), endPoint.lon(), endPoint.lat());
	}

	/** 좌표 기반 길찾기 (Double 버전) */
	private List<OdSayResponseDTO.Path> findPathsBetweenCoords(Double sx, Double sy, Double ex, Double ey) {
		final String url = "https://api.odsay.com/v1/api/searchPubTransPathT";
		URI uri = UriComponentsBuilder.fromHttpUrl(url)
			.queryParam("apiKey", odsayApiKey)
			.queryParam("SX", sx).queryParam("SY", sy)
			.queryParam("EX", ex).queryParam("EY", ey)
			.encode(StandardCharsets.UTF_8).build().toUri();

		OdSayResponseDTO res = restTemplate.getForObject(uri, OdSayResponseDTO.class);
		if (res == null || res.getResult() == null || res.getResult().getPath() == null || res.getResult().getPath().isEmpty()) {
			throw new IllegalStateException("길찾기 결과가 없습니다. [%.6f,%.6f -> %.6f,%.6f]".formatted(sx, sy, ex, ey));
		}
		return res.getResult().getPath();
	}

	private OdSayResponseDTO.Path findShortestDistancePathSegment(List<OdSayResponseDTO.Path> paths) {
		return paths.stream()
			.min(Comparator.comparingInt(p -> p.getInfo().getTotalDistance()))
			.orElseThrow(() -> new IllegalStateException("최단 경로 선택 실패"));
	}

	private OdSayResponseDTO.Path findMinTransferPathSegment(List<OdSayResponseDTO.Path> paths) {
		return paths.stream()
			.min(Comparator.comparingInt(p -> p.getInfo().getBusTransitCount() + p.getInfo().getSubwayTransitCount()))
			.orElseThrow(() -> new IllegalStateException("최소 환승 선택 실패"));
	}

	// 상세 복구용 메타 - 캐시에 저장
	public record RouteMeta(
		String departure,
		String destination,
		List<String> stopovers,
		String departureTime,
		String option // 어떤 경로인지
	) {}

	/** 길안내 시작: 캐시 메타로 상세 재생성 → DB 저장 */
	@Transactional
	public RouteLog startNavigation(String routeKey, Integer memberId) {
		RecommendedRouteDTO summary = cache.getSummary(routeKey, RecommendedRouteDTO.class);
		RouteMeta meta = cache.getMeta(routeKey, RouteMeta.class);
		if (meta == null) {
			throw new IllegalStateException("메타 정보가 없어 저장할 수 없습니다. routeKey=" + routeKey);
		}

		RouteDetailDTO detail = buildDetailFromOdsay(meta);

		Member member = memberRepository.findById(memberId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

		RouteLog log = new RouteLog();
		log.setMember(member);
		log.setDeparture(meta.departure);
		log.setDestination(meta.destination);
		if (summary != null) {
			log.setPredictedTime(summary.getTimeTaken());
			log.setPredictedFatigue(summary.getFatigue());
		}
		log.setTimeTaken(null);
		log.setFatigue(null);
		log.setStartedAt(LocalDateTime.now());
		log.setUsed(Boolean.TRUE);

		routeLogRepository.save(log);

		int idx = 1;
		for (RouteDetailDTO.Leg leg : detail.getData()) {
			RouteInfo info = new RouteInfo();
			info.setRouteId(log.getId());
			info.setOrder(idx++);
			info.setDeparture(leg.getStartPoint());
			info.setDestination(leg.getEndPoint());
			info.setType(mapToRouteTypeFromString(leg.getType()));
			info.setLineName(leg.getLineName());
			info.setTimeTaken(leg.getTimeTaken());
			info.setWalkDistance(null);
			info.setStartLat(leg.getStartLat());
			info.setStartLng(leg.getStartLng());
			info.setEndLat(leg.getEndLat());
			info.setEndLng(leg.getEndLng());
			info.setRouteLog(log);

			routeInfoRepository.save(info);
		}

		return log;
	}

	/** findRoute의 계산 로직을 다시 수행해서 상세 레그를 만듦 */
	private RouteDetailDTO buildDetailFromOdsay(RouteMeta meta) {
		List<String> waypoints = new ArrayList<>();
		waypoints.add(meta.departure);
		if (meta.stopovers != null && !meta.stopovers.isEmpty()) waypoints.addAll(meta.stopovers);
		waypoints.add(meta.destination);

		Function<List<OdSayResponseDTO.Path>, OdSayResponseDTO.Path> selector =
			"MIN_TRANSFER".equals(meta.option)
				? this::findMinTransferPathSegment
				: this::findShortestDistancePathSegment;

		List<RouteDetailDTO.Leg> legs = new ArrayList<>();
		int totalMinutes = 0;
		int orderCounter = 1;

		for (int i = 0; i < waypoints.size() - 1; i++) {
			List<OdSayResponseDTO.Path> paths = findPathsBetween(waypoints.get(i), waypoints.get(i + 1));
			OdSayResponseDTO.Path selected = selector.apply(paths);
			totalMinutes += selected.getInfo().getTotalTime();

			List<RouteDetailDTO.PolylinePointDTO> segmentPolyline = loadLanePolyline(selected);

			if (selected.getSubPath() != null) {
				for (OdSayResponseDTO.SubPath sp : selected.getSubPath()) {
					RouteDetailDTO.Leg leg = toLeg(orderCounter++, sp);
					leg = enrichLegWithGeocoding(leg);

					List<RouteDetailDTO.PolylinePointDTO> legPolyline =
						clipPolylineForLeg(segmentPolyline, leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
					if (legPolyline == null || legPolyline.isEmpty()) {
						legPolyline = buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
					}
					leg.setPolyline(legPolyline);

					legs.add(leg);
				}
			}
		}

		LocalDateTime dep = LocalDateTime.parse(meta.departureTime, FMT);
		String arrival = dep.plusMinutes(totalMinutes).format(FMT);

		return RouteDetailDTO.builder()
			.totalTime(totalMinutes)
			.departureTime(meta.departureTime)
			.arrivalTime(arrival)
			.fatigue(0)
			.data(legs)
			.build();
	}

	/** 정류장/역 좌표만으로 간이 폴리라인 만드는 폴백 */
	private List<RouteDetailDTO.PolylinePointDTO> buildPolylineFromStations(
		List<RouteDetailDTO.PathNodeDTO> stations,
		Double startLat, Double startLng,
		Double endLat, Double endLng
	) {
		List<RouteDetailDTO.PolylinePointDTO> list = new ArrayList<>();

		if (startLat != null && startLng != null) {
			list.add(RouteDetailDTO.PolylinePointDTO.builder()
				.lat(startLat).lng(startLng).build());
		}

		if (stations != null && !stations.isEmpty()) {
			for (RouteDetailDTO.PathNodeDTO n : stations) {
				if (n.getLat() != null && n.getLng() != null) {
					if (list.isEmpty()
						|| !Objects.equals(list.get(list.size()-1).getLat(), n.getLat())
						|| !Objects.equals(list.get(list.size()-1).getLng(), n.getLng())) {
						list.add(RouteDetailDTO.PolylinePointDTO.builder()
							.lat(n.getLat()).lng(n.getLng()).build());
					}
				}
			}
		}

		if (endLat != null && endLng != null) {
			if (list.isEmpty()
				|| !Objects.equals(list.get(list.size()-1).getLat(), endLat)
				|| !Objects.equals(list.get(list.size()-1).getLng(), endLng)) {
				list.add(RouteDetailDTO.PolylinePointDTO.builder()
					.lat(endLat).lng(endLng).build());
			}
		}

		return list;
	}

	/** 레그단위 자연스러운 폴리라인 만들기 위한 함수 */
	private List<RouteDetailDTO.PolylinePointDTO> buildPolylineForDetailLeg(RouteDetailDTO.Leg leg) {
		if (!"BUS".equals(leg.getType()) && !"SUBWAY".equals(leg.getType())) {
			return buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
		}

		try {
			List<OdSayResponseDTO.Path> candidates;
			if (leg.getStartLat()!=null && leg.getStartLng()!=null && leg.getEndLat()!=null && leg.getEndLng()!=null) {
				candidates = findPathsBetweenCoords(leg.getStartLng(), leg.getStartLat(), leg.getEndLng(), leg.getEndLat());
			} else if (leg.getStartPoint()!=null && leg.getEndPoint()!=null) {
				candidates = findPathsBetween(leg.getStartPoint(), leg.getEndPoint());
			} else {
				return buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
			}
			if (candidates == null || candidates.isEmpty()) {
				return buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
			}

			OdSayResponseDTO.Path chosen = candidates.stream()
				.filter(p -> p.getSubPath()!=null && p.getSubPath().stream().anyMatch(sp -> {
					String t = (sp.getTrafficType()==1) ? "SUBWAY" : (sp.getTrafficType()==2) ? "BUS" : "WALKING";
					String ln = pickLineName(sp, t);
					return Objects.equals(t, leg.getType()) &&
						(leg.getLineName()==null || Objects.equals(leg.getLineName(), ln));
				}))
				.findFirst()
				.orElse(candidates.get(0));

			String mapObj = (chosen.getInfo() != null) ? chosen.getInfo().getMapObj() : null;
			log.debug("[polyline] leg={}, type={}, line={}, mapObj={}",
				leg.getOrder(), leg.getType(), leg.getLineName(), mapObj);
			List<RouteDetailDTO.PolylinePointDTO> segmentPolyline = loadLanePolyline(mapObj);
			log.debug("[polyline] loadLane points={}", segmentPolyline.size());

			if (segmentPolyline.isEmpty() && chosen.getSubPath()!=null) {
				for (OdSayResponseDTO.SubPath sp : chosen.getSubPath()) {
					String t = (sp.getTrafficType()==1) ? "SUBWAY" : (sp.getTrafficType()==2) ? "BUS" : "WALKING";
					String ln = pickLineName(sp, t);
					if (Objects.equals(t, leg.getType()) &&
						(leg.getLineName()==null || Objects.equals(leg.getLineName(), ln))) {

						if (sp.getLane()!=null && !sp.getLane().isEmpty()) {
							String laneMapObj = sp.getLane().get(0).getMapObj();
							log.debug("[polyline] laneMapObj fallback = {}", laneMapObj);
							if (laneMapObj != null && !laneMapObj.isBlank()) {
								List<RouteDetailDTO.PolylinePointDTO> lanePts = loadLanePolyline(laneMapObj);
								if (!lanePts.isEmpty()) segmentPolyline = lanePts;
							}
						}
						break;
					}
				}
			}

			List<RouteDetailDTO.PolylinePointDTO> legPolyline =
				clipPolylineForLeg(segmentPolyline, leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
			if (legPolyline == null || legPolyline.isEmpty()) {
				legPolyline = buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
			}

			if (legPolyline.size() < 30) {
				legPolyline = densifyLine(legPolyline, 30.0);
			}

			return legPolyline;

		} catch (Exception ignore) {
			return buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
		}
	}

	/** path.getInfo().getMapObj()에서 전체 폴리라인 로드 */
	private List<RouteDetailDTO.PolylinePointDTO> loadLanePolyline(OdSayResponseDTO.Path path) {
		String mapObj = (path.getInfo() != null) ? path.getInfo().getMapObj() : null;
		return loadLanePolyline(mapObj);
	}

	/** mapObj로 loadLane 호출 (캐시 포함) */
	private List<RouteDetailDTO.PolylinePointDTO> loadLanePolyline(String mapObj) {
		try {
			if (mapObj == null || mapObj.isBlank()) return Collections.emptyList();

			String key = "loadlane:" + mapObj;
			List<?> cached = cache.get(key, List.class);
			if (cached != null && !cached.isEmpty()) {
				@SuppressWarnings("unchecked")
				List<RouteDetailDTO.PolylinePointDTO> casted = (List<RouteDetailDTO.PolylinePointDTO>) cached;
				return casted;
			}

			OdsayClient.LoadLaneResponse res = odsayClient.loadLane(mapObj);
			List<RouteDetailDTO.PolylinePointDTO> pts = new ArrayList<>();
			if (res != null && res.getResult() != null && res.getResult().getLane() != null) {
				for (OdsayClient.LoadLaneResponse.Lane ln : res.getResult().getLane()) {
					if (ln.getSection() == null) continue;
					for (OdsayClient.LoadLaneResponse.Section sec : ln.getSection()) {
						if (sec.getGraphPos() == null) continue;
						for (OdsayClient.LoadLaneResponse.GraphPos gp : sec.getGraphPos()) {
							pts.add(RouteDetailDTO.PolylinePointDTO.builder()
								.lat(gp.getY()).lng(gp.getX()).build());
						}
					}
				}
			}
			if (!pts.isEmpty()) cache.save(key, pts, 60 * 60 * 24);
			return pts;
		} catch (Exception e) {
			return Collections.emptyList();
		}
	}

	/** 전체를 레그의 시작/끝 인덱스로 잘라서 해당 구간만 추출 */
	private List<RouteDetailDTO.PolylinePointDTO> clipPolylineForLeg(
		List<RouteDetailDTO.PolylinePointDTO> segment,
		Double startLat, Double startLng, Double endLat, Double endLng
	) {
		if (segment == null || segment.isEmpty()
			|| startLat == null || startLng == null || endLat == null || endLng == null) {
			return Collections.emptyList();
		}
		int sIdx = nearestIndex(segment, startLat, startLng);
		int eIdx = nearestIndex(segment, endLat, endLng);
		if (sIdx == -1 || eIdx == -1) return Collections.emptyList();

		if (sIdx <= eIdx) return new ArrayList<>(segment.subList(sIdx, eIdx + 1)); // 정방향
		List<RouteDetailDTO.PolylinePointDTO> rev = new ArrayList<>(segment.subList(eIdx, sIdx + 1)); // 역방향
		Collections.reverse(rev);
		return rev;
	}

	/** 하버사인 기반 최근접 인덱스 */
	private int nearestIndex(List<RouteDetailDTO.PolylinePointDTO> pts, double lat, double lng) {
		double best = Double.MAX_VALUE;
		int idx = -1;
		for (int i = 0; i < pts.size(); i++) {
			RouteDetailDTO.PolylinePointDTO p = pts.get(i);
			double dLat = Math.toRadians(p.getLat() - lat);
			double dLng = Math.toRadians(p.getLng() - lng);
			double a = Math.sin(dLat/2)*Math.sin(dLat/2)
				+ Math.cos(Math.toRadians(lat))*Math.cos(Math.toRadians(p.getLat()))
				* Math.sin(dLng/2)*Math.sin(dLng/2);
			double d = 2 * 6371000.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			if (d < best) { best = d; idx = i; }
		}
		return idx;
	}

	/** ODSay의 SubPath를 dgg의 Leg로 변환 */
	private RouteDetailDTO.Leg toLeg(int order, OdSayResponseDTO.SubPath sp) {
		String type = (sp.getTrafficType() == 1) ? "SUBWAY"
			: (sp.getTrafficType() == 2) ? "BUS" : "WALKING";
		String lineName = pickLineName(sp, type);

		List<RouteDetailDTO.PathNodeDTO> path = new ArrayList<>();
		if (sp.getPassStopList() != null && sp.getPassStopList().getStations() != null) {
			int seq = 1;
			for (OdSayResponseDTO.Station st : sp.getPassStopList().getStations()) {
				path.add(RouteDetailDTO.PathNodeDTO.builder()
					.seq(seq++)
					.name(st.getStationName())
					.stationId(st.getStationID() == null ? null : String.valueOf(st.getStationID()))
					.lat(st.getY())  // y=lat
					.lng(st.getX())  // x=lng
					.build());
			}
		}

		Double startLat = sp.getStartY();
		Double startLng = sp.getStartX();
		Double endLat   = sp.getEndY();
		Double endLng   = sp.getEndX();

		return RouteDetailDTO.Leg.builder()
			.order(order)
			.type(type)
			.lineName(lineName)
			.timeTaken(sp.getSectionTime())
			.startPoint(sp.getStartName())
			.endPoint(sp.getEndName())
			.startLat(startLat)
			.startLng(startLng)
			.endLat(endLat)
			.endLng(endLng)
			.path(path)
			.build();
	}

	/** 필요 시 지오코딩으로 좌표 보강 */
	private RouteDetailDTO.Leg enrichLegWithGeocoding(RouteDetailDTO.Leg leg) {
		if ((leg.getStartLat() == null || leg.getStartLng() == null)
			&& leg.getStartPoint() != null && !leg.getStartPoint().isBlank()) {
			Point p = geocodingService.getCoordinates(leg.getStartPoint());
			if (p != null) {
				leg.setStartLat(p.lat());
				leg.setStartLng(p.lon());
			}
		}

		if ((leg.getEndLat() == null || leg.getEndLng() == null)
			&& leg.getEndPoint() != null && !leg.getEndPoint().isBlank()) {
			Point p = geocodingService.getCoordinates(leg.getEndPoint());
			if (p != null) {
				leg.setEndLat(p.lat());
				leg.setEndLng(p.lon());
			}
		}

		return leg;
	}

	private String pickLineName(OdSayResponseDTO.SubPath sp, String type) {
		List<OdSayResponseDTO.Lane> lanes = sp.getLane();
		if (lanes == null || lanes.isEmpty()) return null;

		OdSayResponseDTO.Lane first = lanes.get(0);
		if ("SUBWAY".equals(type)) return first.getName();
		if ("BUS".equals(type)) return first.getBusNo();

		return null;
	}

	private RouteType mapToRouteTypeFromString(String type) {
		if (type == null) throw new IllegalArgumentException("타입이 비어있습니다.");
		return switch (type.toUpperCase()) {
			case "SUBWAY" -> RouteType.SUBWAY;
			case "BUS" -> RouteType.BUS;
			case "WALK", "WALKING" -> RouteType.WALKING;
			default -> throw new IllegalArgumentException("Unknown type: " + type);
		};
	}

	/**
	 * route_info 레코드를 기반으로 leg의 전체 path 재구성
	 */
	private List<RouteDetailDTO.PathNodeDTO> reconstructPathForLeg(RouteDetailDTO.Leg leg) {
		try {
			List<OdSayResponseDTO.Path> candidates;
			if (leg.getStartLat() != null && leg.getStartLng() != null
				&& leg.getEndLat() != null && leg.getEndLng() != null) {
				candidates = findPathsBetweenCoords(
					leg.getStartLng(), leg.getStartLat(), // SX, SY
					leg.getEndLng(), leg.getEndLat()      // EX, EY
				);
			} else if (leg.getStartPoint() != null && leg.getEndPoint() != null) {
				candidates = findPathsBetween(leg.getStartPoint(), leg.getEndPoint());
			} else {
				return Collections.emptyList();
			}

			for (OdSayResponseDTO.Path p : candidates) {
				if (p.getSubPath() == null) continue;
				for (OdSayResponseDTO.SubPath sp : p.getSubPath()) {
					String t = (sp.getTrafficType() == 1) ? "SUBWAY" : (sp.getTrafficType() == 2) ? "BUS" : "WALKING";
					String ln = pickLineName(sp, t);
					if (Objects.equals(t, leg.getType())
						&& (leg.getLineName() == null || Objects.equals(leg.getLineName(), ln))) {
						return convertStations(sp);
					}
				}
			}

			OdSayResponseDTO.Path first = candidates.get(0);
			if (first.getSubPath() != null && !first.getSubPath().isEmpty()) {
				return convertStations(first.getSubPath().get(0));
			}
		} catch (Exception e) {
			// 폴백은 아래에서
		}

		List<RouteDetailDTO.PathNodeDTO> fallback = new ArrayList<>();
		int seq = 1;

		if (leg.getStartPoint() != null) {
			fallback.add(RouteDetailDTO.PathNodeDTO.builder()
				.seq(seq++)
				.name(leg.getStartPoint())
				.stationId(null)
				.lat(leg.getStartLat())
				.lng(leg.getStartLng())
				.build());
		}

		if (leg.getEndPoint() != null) {
			fallback.add(RouteDetailDTO.PathNodeDTO.builder()
				.seq(seq)
				.name(leg.getEndPoint())
				.stationId(null)
				.lat(leg.getEndLat())
				.lng(leg.getEndLng())
				.build());
		}
		return fallback;
	}

	/** ODsay SubPath → PathNodeDTO 리스트 변환 */
	private List<RouteDetailDTO.PathNodeDTO> convertStations(OdSayResponseDTO.SubPath sp) {
		List<RouteDetailDTO.PathNodeDTO> list = new ArrayList<>();
		if (sp.getPassStopList() != null && sp.getPassStopList().getStations() != null) {
			int seq = 1;
			for (OdSayResponseDTO.Station st : sp.getPassStopList().getStations()) {
				list.add(RouteDetailDTO.PathNodeDTO.builder()
					.seq(seq++)
					.name(st.getStationName())
					.stationId(st.getStationID() == null ? null : String.valueOf(st.getStationID()))
					.lat(st.getY())
					.lng(st.getX())
					.build());
			}
		}
		return list;
	}

	/** 선분을 일정 간격으로 보강 */
	private List<RouteDetailDTO.PolylinePointDTO> densifyLine(
		List<RouteDetailDTO.PolylinePointDTO> line, double maxStepMeters) {

		if (line == null || line.size() < 2) return line;
		List<RouteDetailDTO.PolylinePointDTO> out = new ArrayList<>();
		out.add(line.get(0));

		for (int i = 0; i < line.size() - 1; i++) {
			var a = line.get(i);
			var b = line.get(i + 1);

			double dist = haversine(a.getLat(), a.getLng(), b.getLat(), b.getLng());
			int steps = (int) Math.floor(dist / maxStepMeters);

			for (int s = 1; s <= steps; s++) {
				double t = (double) s / (steps + 1);
				out.add(RouteDetailDTO.PolylinePointDTO.builder()
					.lat(a.getLat() + (b.getLat() - a.getLat()) * t)
					.lng(a.getLng() + (b.getLng() - a.getLng()) * t)
					.build());
			}
			out.add(b);
		}
		return out;
	}

	private double haversine(double lat1, double lon1, double lat2, double lon2) {
		double R = 6371000.0;
		double dLat = Math.toRadians(lat2 - lat1);
		double dLon = Math.toRadians(lon2 - lon1);
		double a = Math.sin(dLat/2)*Math.sin(dLat/2)
			+ Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))
			* Math.sin(dLon/2)*Math.sin(dLon/2);
		return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	}

	@Override
	@Transactional(readOnly = true)
	public List<StationCoordDTO> getShortestStationsByCoords(double sx, double sy, double ex, double ey) {
		validateCoords(sy, sx);
		validateCoords(ey, ex);

		List<OdSayResponseDTO.Path> candidates = findPathsBetweenCoords(sx, sy, ex, ey);
		OdSayResponseDTO.Path shortest = pickShortest(candidates);
		return extractStations(shortest);
	}

	/** 좌표 검증 */
	private void validateCoords(double lat, double lng) {
		if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
			throw new IllegalArgumentException("잘못된 좌표 값입니다. lat=" + lat + ", lng=" + lng);
		}
	}

	/** 좌표 기반 길찾기 호출 (primitive 버전) */
	private List<OdSayResponseDTO.Path> findPathsBetweenCoords(double sx, double sy, double ex, double ey) {
		final String url = "https://api.odsay.com/v1/api/searchPubTransPathT";
		URI uri = UriComponentsBuilder.fromHttpUrl(url)
			.queryParam("apiKey", odsayApiKey)
			.queryParam("SX", sx).queryParam("SY", sy)
			.queryParam("EX", ex).queryParam("EY", ey)
			.encode(StandardCharsets.UTF_8).build().toUri();

		OdSayResponseDTO res = restTemplate.getForObject(uri, OdSayResponseDTO.class);
		if (res == null || res.getResult() == null || res.getResult().getPath() == null || res.getResult().getPath().isEmpty()) {
			throw new IllegalStateException("길찾기 결과가 없습니다. [%.6f,%.6f -> %.6f,%.6f]".formatted(sx, sy, ex, ey));
		}
		return res.getResult().getPath();
	}

	/** 최단거리 Path 선택 */
	private OdSayResponseDTO.Path pickShortest(List<OdSayResponseDTO.Path> paths) {
		return paths.stream()
			.min(Comparator.comparingInt(p -> p.getInfo().getTotalDistance()))
			.orElseThrow(() -> new IllegalStateException("최단 경로 선택 실패"));
	}

	/** 선택된 Path에서 BUS/SUBWAY 구간의 모든 정류장/역 좌표 평탄화 */
	private List<StationCoordDTO> extractStations(OdSayResponseDTO.Path path) {
		List<StationCoordDTO> out = new ArrayList<>();
		if (path == null || path.getSubPath() == null) return out;

		for (OdSayResponseDTO.SubPath sp : path.getSubPath()) {
			int t = sp.getTrafficType(); // 1=subway, 2=bus, 3=walk
			if (t != 1 && t != 2) continue; // 걷기는 스킵
			if (sp.getPassStopList() == null || sp.getPassStopList().getStations() == null) continue;

			for (OdSayResponseDTO.Station st : sp.getPassStopList().getStations()) {
				if (st == null || st.getY() == null || st.getX() == null) continue;
				out.add(StationCoordDTO.builder()
					.lat(st.getY()) // y=lat
					.lng(st.getX()) // x=lng
					.build());
			}
		}

		// 연속 중복 좌표 제거
		if (!out.isEmpty()) {
			List<StationCoordDTO> dedup = new ArrayList<>();
			StationCoordDTO prev = null;
			for (StationCoordDTO cur : out) {
				if (prev == null
					|| !Objects.equals(prev.getLat(), cur.getLat())
					|| !Objects.equals(prev.getLng(), cur.getLng())) {
					dedup.add(cur);
					prev = cur;
				}
			}
			return dedup;
		}
		return out;
	}

	// ==== (4) 최단경로의 path 노드 모으기 ====

	private List<LatLon> collectPathLatLonsFromPayload(List<RoutePayload> data) {
		List<LatLon> out = new ArrayList<>();
		if (data == null || data.isEmpty()) return out;

		for (RoutePayload seg : data) {
			List<RoutePayload.PathNode> nodes = seg.path();
			if (nodes != null && !nodes.isEmpty()) {
				for (RoutePayload.PathNode n : nodes) {
					if (n == null) continue;
					Double lat = n.lat();
					Double lng = n.lng();
					if (lat != null && lng != null) {
						appendIfNotDup(out, lat, lng);
					}
				}
			} else {
				if (seg.startLat() != null && seg.startLng() != null) {
					appendIfNotDup(out, seg.startLat(), seg.startLng());
				}
				if (seg.endLat() != null && seg.endLng() != null) {
					appendIfNotDup(out, seg.endLat(), seg.endLng());
				}
			}
		}

		if (out.isEmpty()) {
			for (RoutePayload seg : data) {
				if (seg.startLat() != null && seg.startLng() != null) {
					appendIfNotDup(out, seg.startLat(), seg.startLng());
				}
				if (seg.endLat() != null && seg.endLng() != null) {
					appendIfNotDup(out, seg.endLat(), seg.endLng());
				}
			}
		}
		return out;
	}

	private void appendIfNotDup(List<LatLon> list, Double lat, Double lng) {
		if (lat == null || lng == null) return;
		int n = list.size();
		if (n == 0) {
			list.add(new LatLon(lat, lng));
			return;
		}
		LatLon prev = list.get(n - 1);
		if (prev == null || Double.compare(prev.lat(), lat) != 0 || Double.compare(prev.lon(), lng) != 0) {
			list.add(new LatLon(lat, lng));
		}
	}

	/**
	 * ODSay Path[] → RoutePayload 리스트 변환
	 */
	private List<RoutePayload> mapPathsToPayloads(List<OdSayResponseDTO.Path> paths) {
		List<RoutePayload> out = new ArrayList<>();
		if (paths == null || paths.isEmpty()) return out;

		for (OdSayResponseDTO.Path p : paths) {
			List<OdSayResponseDTO.SubPath> subs = safeSubPaths(p);
			if (subs == null || subs.isEmpty()) continue;

			int order = 1;
			for (OdSayResponseDTO.SubPath sp : subs) {
				int trafficType = sp.getTrafficType(); // 1:지하철, 2:버스, 3:도보
				String type = switch (trafficType) {
					case 1 -> "SUBWAY";
					case 2 -> "BUS";
					default -> "WALKING";
				};

				Integer sectionMin = sp.getSectionTime(); // 분
				String startName = nvl(sp.getStartName());
				String endName   = nvl(sp.getEndName());

				String lineName = null;
				try {
					List<OdSayResponseDTO.Lane> lanes = sp.getLane();
					if (lanes != null && !lanes.isEmpty()) {
						if (notEmpty(lanes.get(0).getBusNo())) {
							lineName = lanes.get(0).getBusNo();
						}
						if (notEmpty(lanes.get(0).getName())) {
							lineName = lanes.get(0).getName();
						}
					}
				} catch (Throwable ignore) {}

				List<RoutePayload.PathNode> nodes = new ArrayList<>();
				Double startLat = null, startLng = null, endLat = null, endLng = null;
				try {
					OdSayResponseDTO.PassStopList pass = sp.getPassStopList();
					if (pass != null && pass.getStations() != null) {
						for (OdSayResponseDTO.Station st : pass.getStations()) {
							Double lat = safeDouble(st.getY()); // y=lat
							Double lng = safeDouble(st.getX()); // x=lng
							String nm  = nvl(st.getStationName());
							if (lat != null && lng != null) {
								nodes.add(new RoutePayload.PathNode(nm, lat, lng));
							}
						}
						if (!nodes.isEmpty()) {
							startLat = nodes.get(0).lat(); startLng = nodes.get(0).lng();
							var last = nodes.get(nodes.size() - 1);
							endLat = last.lat(); endLng = last.lng();
						}
					}
				} catch (Throwable ignore) {}

				if (startLat == null || startLng == null || endLat == null || endLng == null) {
					try {
						Double sLat = safeDouble(sp.getStartY());
						Double sLng = safeDouble(sp.getStartX());
						Double eLat = safeDouble(sp.getEndY());
						Double eLng = safeDouble(sp.getEndX());
						if (sLat != null && sLng != null) { startLat = sLat; startLng = sLng; }
						if (eLat != null && eLng != null) { endLat = eLat; endLng = eLng; }
					} catch (Throwable ignore) {}
				}

				out.add(new RoutePayload(
					type,
					lineName,
					sectionMin,
					startName, endName,
					startLat, startLng, endLat, endLng,
					nodes.isEmpty() ? null : nodes,
					order++,
					null, // polyline 없음
					null  // etaMin 없음
				));
			}

			// dep↔dest 한 개 경로만 사용
			break;
		}
		return out;
	}

	// ===== 유틸 =====

	private static String nvl(String s) { return s == null ? "" : s; }
	private static boolean notEmpty(String s) { return s != null && !s.isBlank(); }

	private static Integer safeInteger(Object o) {
		if (o == null) return null;
		if (o instanceof Integer i) return i;
		if (o instanceof Number n) return n.intValue();
		try { return Integer.parseInt(o.toString()); } catch (Exception e) { return null; }
	}
	private static int safeInt(Object o) {
		Integer i = safeInteger(o);
		return i == null ? 0 : i;
	}
	private static Double safeDouble(Object o) {
		if (o == null) return null;
		if (o instanceof Double d) return d;
		if (o instanceof Number n) return n.doubleValue();
		try { return Double.parseDouble(o.toString()); } catch (Exception e) { return null; }
	}

	/** ODsay Path → SubPath 안전 접근 */
	private static List<OdSayResponseDTO.SubPath> safeSubPaths(OdSayResponseDTO.Path p) {
		try { return p.getSubPath(); } catch (Throwable t) { return null; }
	}

	// ===== 최소 피로 경로 계산 (경유 후보 5개) =====
	private RecommendedRouteDTO computeMinFatigueRoute(RouteRequestDTO req) {
		final String depAddr = req.getDepartureAddress();
		final String destAddr = req.getDestinationAddress();
		final String startTime = req.getStartTime();
		final Integer memberId = null; // 로그인 연동 전이면 null

		Point depPt  = geocodingService.getCoordinates(depAddr);
		Point destPt = geocodingService.getCoordinates(destAddr);
		if (depPt == null || destPt == null)
			throw new IllegalStateException("지오코딩 실패: 출/도착 좌표를 얻을 수 없습니다.");

		List<OdSayResponseDTO.Path> baseCandidates = findPathsBetweenCoords(depPt.lon(), depPt.lat(), destPt.lon(), destPt.lat());
		OdSayResponseDTO.Path baseShortest = findShortestDistancePathSegment(baseCandidates);
		List<RoutePayload> basePayload = mapPathsToPayloads(List.of(baseShortest));
		List<LatLon> basePathNodes = collectPathLatLonsFromPayload(basePayload);

		Integer timeSlot = toTimeSlot(startTime);
		List<TopCandidateDto> top5 = waypointService.pickTop5Waypoint(
			basePathNodes,
			1000,
			timeSlot,
			0.1, 0.9
		).blockOptional().orElseGet(List::of);

		if (top5.isEmpty()) {
			String id = RouteKeyUtil.makeRouteId(depAddr, destAddr, "MIN_FATIGUE", startTime);
			int minutes = baseShortest.getInfo().getTotalTime();
			String arrival = LocalDateTime.parse(startTime, FMT).plusMinutes(minutes).format(FMT);
			return RecommendedRouteDTO.builder()
				.routeKey(id).name("최소 피로 경로")
				.timeTaken(minutes).arrivalTime(arrival).fatigue(50)
				.build();
		}

		double bestScore = Double.POSITIVE_INFINITY;
		RecommendedRouteDTO bestRoute = null;

		for (TopCandidateDto c : top5) {
			List<OdSayResponseDTO.Path> depToWp = tryFindPathsBetweenCoords(depPt.lon(), depPt.lat(), c.lon(), c.lat());
			List<OdSayResponseDTO.Path> wpToDest = tryFindPathsBetweenCoords(c.lon(), c.lat(), destPt.lon(), destPt.lat());

			List<RoutePayload> payloadA;
			if (!depToWp.isEmpty()) {
				payloadA = mapPathsToPayloads(depToWp);
			} else {
				if (isShortDistance(depPt.lat(), depPt.lon(), c.lat(), c.lon(), 1200.0)) {
					payloadA = synthesizeWalkingPayload(depPt.lat(), depPt.lon(), req.getDepartureAddress(),
						c.lat(), c.lon(), c.name());
				} else {
					log.debug("[min-fatigue] dep->wp 결과 없음, 거리도 짧지 않아 후보 스킵: stopId={}", c.stopId());
					continue;
				}
			}

			List<RoutePayload> payloadB;
			if (!wpToDest.isEmpty()) {
				payloadB = mapPathsToPayloads(wpToDest);
			} else {
				if (isShortDistance(c.lat(), c.lon(), destPt.lat(), destPt.lon(), 1200.0)) {
					payloadB = synthesizeWalkingPayload(c.lat(), c.lon(), c.name(),
						destPt.lat(), destPt.lon(), req.getDestinationAddress());
				} else {
					log.debug("[min-fatigue] wp->dest 결과 없음, 거리도 짧지 않아 후보 스킵: stopId={}", c.stopId());
					continue;
				}
			}

			List<RoutePayload> whole = new ArrayList<>(payloadA);
			whole.addAll(payloadB);

			double fatigueScore = fatigueService.calculateFatigueFromPayload(memberId, whole);

			if (fatigueScore < bestScore) {
				bestScore = fatigueScore;

				int totalMin = estimateMinutesFromPayloads(whole);
				String arrival = LocalDateTime.parse(startTime, FMT).plusMinutes(totalMin).format(FMT);

				bestRoute = RecommendedRouteDTO.builder()
					.routeKey(RouteKeyUtil.makeRouteId(depAddr, destAddr, "MIN_FATIGUE", startTime))
					.name("최소 피로도")
					.timeTaken(totalMin)
					.arrivalTime(arrival)
					.fatigue((int)Math.round(bestScore))
					.build();
			}
		}

		if (bestRoute == null) {
			OdSayResponseDTO.Path fallback = baseShortest;
			int minutes = (fallback != null && fallback.getInfo()!=null) ? fallback.getInfo().getTotalTime() : 0;
			String arrival = LocalDateTime.parse(startTime, FMT).plusMinutes(minutes).format(FMT);
			bestRoute = RecommendedRouteDTO.builder()
				.routeKey(RouteKeyUtil.makeRouteId(depAddr, destAddr, "MIN_FATIGUE", startTime))
				.name("최소 피로 경로")
				.timeTaken(minutes)
				.arrivalTime(arrival)
				.fatigue(50)
				.build();
		}

		cache.saveSummary(bestRoute.getRouteKey(), bestRoute);
		cache.saveMeta(bestRoute.getRouteKey(), new RouteMeta(depAddr, destAddr, req.getStopoverAddresses(), startTime, "MIN_FATIGUE"));

		return bestRoute;
	}

	private Integer toTimeSlot(String startTime) {
		if (startTime == null || startTime.length() < 13) return null;
		try { return Integer.parseInt(startTime.substring(11, 13)); }
		catch (Exception e) { return null; }
	}

	private int estimateMinutesFromPayloads(List<RoutePayload> payloads) {
		if (payloads == null) return 0;
		return payloads.stream()
			.map(RoutePayload::timeTaken)
			.filter(Objects::nonNull)
			.mapToInt(Integer::intValue)
			.sum();
	}

	private List<OdSayResponseDTO.Path> tryFindPathsBetweenCoords(double sx, double sy, double ex, double ey) {
		try {
			return findPathsBetweenCoords(sx, sy, ex, ey);
		} catch (IllegalStateException e) {
			log.warn("[min-fatigue] ODsay 결과 없음: [{} ,{} -> {} ,{}] - {}", sx, sy, ex, ey, e.getMessage());
			return Collections.emptyList();
		}
	}

	private boolean isShortDistance(double lat1, double lng1, double lat2, double lng2, double thresholdMeters) {
		return haversine(lat1, lng1, lat2, lng2) <= thresholdMeters;
	}

	private List<RoutePayload> synthesizeWalkingPayload(double sLat, double sLng, String sName,
		double eLat, double eLng, String eName) {
		double distM = haversine(sLat, sLng, eLat, eLng);
		int minutes = Math.max(1, (int)Math.round(distM / 70.0));

		var nodes = new ArrayList<RoutePayload.PathNode>();
		nodes.add(new RoutePayload.PathNode(sName != null ? sName : "출발", sLat, sLng));
		nodes.add(new RoutePayload.PathNode(eName != null ? eName : "도착", eLat, eLng));

		return List.of(new RoutePayload(
			"WALKING",
			null,
			minutes,
			sName, eName,
			sLat, sLng, eLat, eLng,
			nodes,
			1,
			null, null
		));
	}
}

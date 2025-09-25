package S13P21A305.dgg.route.service;

import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.global.external.dto.OdSayResponseDTO;
import S13P21A305.dgg.global.external.service.GeocodingService;
import S13P21A305.dgg.global.external.service.OdsayClient;
import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.repository.MemberRepository;
import S13P21A305.dgg.route.dto.RecommendedRouteDTO;
import S13P21A305.dgg.route.dto.RouteDetailDTO;
import S13P21A305.dgg.route.dto.RouteRequestDTO;
import S13P21A305.dgg.route.dto.RouteResponseDTO;
import S13P21A305.dgg.route.entity.RouteInfo;
import S13P21A305.dgg.route.entity.RouteLog;
import S13P21A305.dgg.route.entity.RouteType;
import S13P21A305.dgg.route.repository.RouteInfoRepository;
import S13P21A305.dgg.route.repository.RouteLogRepository;
import S13P21A305.dgg.route.util.RouteKeyUtil;
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

	@Value("${odsay.api.key}")
	private String odsayApiKey;

	private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	/**
	 * 출발지 - 경유지 - 도착지 사이를 구간별로 ODSay 검색
	 * - 최단거리, 최소환승에 대한 요약 생성
	 * - 캐시에 요약 + 메타 저장
	 * */
	@Override
	public RouteResponseDTO findRoute(RouteRequestDTO routeRequestDTO) {
		List<String> waypoints = new ArrayList<>();
		waypoints.add(routeRequestDTO.getDepartureAddress());
		if (routeRequestDTO.getStopoverAddresses() != null && !routeRequestDTO.getStopoverAddresses().isEmpty()) {
			waypoints.addAll(routeRequestDTO.getStopoverAddresses());
		}
		waypoints.add(routeRequestDTO.getDestinationAddress());

		LocalDateTime depTime = LocalDateTime.parse(routeRequestDTO.getStartTime(), FMT); // 출발시각

		// 최단 경로
		int shortestMinutes = calculateTotalMetric(waypoints, this::findShortestDistancePathSegment, p -> p.getInfo().getTotalTime());
		String shortestArrival = depTime.plusMinutes(shortestMinutes).format(FMT);
		String shortestId = RouteKeyUtil.makeRouteId(
			routeRequestDTO.getDepartureAddress(),
			routeRequestDTO.getDestinationAddress(),
			"SHORTEST",
			routeRequestDTO.getStartTime()
		);
		RecommendedRouteDTO shortest = RecommendedRouteDTO.builder()
			.routeKey(shortestId).name("최단 경로")
			.timeTaken(shortestMinutes).arrivalTime(shortestArrival).fatigue(75)
			.build();

		// 최소 환승
		int minTransferMinutes = calculateTotalMetric(waypoints, this::findMinTransferPathSegment, p -> p.getInfo().getTotalTime());
		String minTransferArrival = depTime.plusMinutes(minTransferMinutes).format(FMT);
		String minTransferId = RouteKeyUtil.makeRouteId(
			routeRequestDTO.getDepartureAddress(),
			routeRequestDTO.getDestinationAddress(),
			"MIN_TRANSFER",
			routeRequestDTO.getStartTime()
		);
		RecommendedRouteDTO minTransfer = RecommendedRouteDTO.builder()
			.routeKey(minTransferId).name("최소 환승")
			.timeTaken(minTransferMinutes).arrivalTime(minTransferArrival).fatigue(60)
			.build();

		// 캐시 저장(요약 + 메타)
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

		return RouteResponseDTO.builder()
			.departureAddress(routeRequestDTO.getDepartureAddress())
			.destinationAddress(routeRequestDTO.getDestinationAddress())
			.stopoverAddresses(routeRequestDTO.getStopoverAddresses())
			.departureTime(routeRequestDTO.getStartTime())
			.destinationTime(representativeArrival)
			.recommendedRoutes(List.of(shortest, minTransfer))
			.build();
	}

	/** routeKey로 요약 복구 */
	@Override
	public RecommendedRouteDTO getSummary(String routeKey) {
		RecommendedRouteDTO s = cache.getSummary(routeKey, RecommendedRouteDTO.class);
		if (s != null) return s; // 캐시에 있으면 그대로

		// 캐시에 없으면 메타로 다시 계산
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

		RecommendedRouteDTO rebuilt = RecommendedRouteDTO.builder()
			.routeKey(routeKey)
			.name("MIN_TRANSFER".equals(meta.option) ? "최소 환승" : "최단 경로")
			.timeTaken(minutes)
			.arrivalTime(arrival)
			.fatigue("MIN_TRANSFER".equals(meta.option) ? 60 : 75)
			.build();

		cache.saveSummary(routeKey, rebuilt);

		return rebuilt;
	}

	/**
	 * DB의 route_log, route_info로 상세경로 만들고,
	 * 레그마다 정류장 리스트(passStopList)를 ODSay 다시 호출해서 복구,
	 * loadLane(mapObj) 써서 폴리라인 생성 - 시작/끝으로 조립 - 부족하면 보강
	 * */
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
	 * 선택 규칙으로 최적 path 하나 골라서, 그 path에서 지표(metric)를 뽑아 합산
	 * */
	private int calculateTotalMetric(List<String> waypoints,
		Function<List<OdSayResponseDTO.Path>, OdSayResponseDTO.Path> pathSelector,
		Function<OdSayResponseDTO.Path, Integer> metricExtractor) {
		int total = 0;
		for (int i = 0; i < waypoints.size() - 1; i++) {
			List<OdSayResponseDTO.Path> paths = findPathsBetween(waypoints.get(i), waypoints.get(i + 1)); // 후보 path 목록 가져오기
			OdSayResponseDTO.Path selected = pathSelector.apply(paths); // 최적의 path 하나 고르기
			total += metricExtractor.apply(selected);
		}
		return total;
	}

	/** 주소 -> 좌표로 변환 */
	private List<OdSayResponseDTO.Path> findPathsBetween(String startAddress, String endAddress) {
		Point startPoint = geocodingService.getCoordinates(startAddress);
		Point endPoint   = geocodingService.getCoordinates(endAddress);

		if (startPoint == null || endPoint == null) {
			throw new IllegalStateException("지오코딩 실패 - 주소를 좌표로 변환하지 못했습니다.");
		}
		return findPathsBetweenCoords(startPoint.lon(), startPoint.lat(), endPoint.lon(), endPoint.lat()); // ODSay 호출
	}

	/** 좌표 기반 길찾기 (주소 지오코딩 없이 바로 호출 가능) */
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

	/** 캐시의 메타로 상세를 새로 구성해서 DB에 route_log, route_info 저장(길안내 시작) */
	@Transactional
	public RouteLog startNavigation(String routeKey, Integer memberId) {
		RecommendedRouteDTO summary = cache.getSummary(routeKey, RecommendedRouteDTO.class);
		RouteMeta meta = cache.getMeta(routeKey, RouteMeta.class);
		if (meta == null) {
			throw new IllegalStateException("메타 정보가 없어 저장할 수 없습니다. routeKey=" + routeKey);
		}

		// 상세는 메타로 다시 생성
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
		// 경유 포함 전체 지점
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
			List<OdSayResponseDTO.Path> paths =
				findPathsBetween(waypoints.get(i), waypoints.get(i + 1));

			OdSayResponseDTO.Path selected = selector.apply(paths);
			totalMinutes += selected.getInfo().getTotalTime();

			List<RouteDetailDTO.PolylinePointDTO> segmentPolyline = loadLanePolyline(selected);

			// 선택된 경로의 subPath를 Leg로 변환
			if (selected.getSubPath() != null) {
				for (OdSayResponseDTO.SubPath sp : selected.getSubPath()) {
					RouteDetailDTO.Leg leg = toLeg(orderCounter++, sp);
					// 좌표 보강
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

		// 시작점
		if (startLat != null && startLng != null) {
			list.add(RouteDetailDTO.PolylinePointDTO.builder()
				.lat(startLat).lng(startLng).build());
		}

		// 경유 정류장/역
		if (stations != null && !stations.isEmpty()) {
			for (RouteDetailDTO.PathNodeDTO n : stations) {
				if (n.getLat() != null && n.getLng() != null) {
					// 직전 점과 동일하면 생략(중복 제거)
					if (list.isEmpty()
						|| !Objects.equals(list.get(list.size()-1).getLat(), n.getLat())
						|| !Objects.equals(list.get(list.size()-1).getLng(), n.getLng())) {
						list.add(RouteDetailDTO.PolylinePointDTO.builder()
							.lat(n.getLat()).lng(n.getLng()).build());
					}
				}
			}
		}

		// 도착점
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
		// 걷기면 그대로 폴백
		if (!"BUS".equals(leg.getType()) && !"SUBWAY".equals(leg.getType())) {
			return buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
		}

		try {
			// 1) 후보 path 고르기 (좌표 우선, 아니면 지명)
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

			// 타입/노선명으로 더 정확한 후보 선택
			OdSayResponseDTO.Path chosen = candidates.stream()
				.filter(p -> p.getSubPath()!=null && p.getSubPath().stream().anyMatch(sp -> {
					String t = (sp.getTrafficType()==1) ? "SUBWAY" : (sp.getTrafficType()==2) ? "BUS" : "WALKING";
					String ln = pickLineName(sp, t);
					return Objects.equals(t, leg.getType()) &&
						(leg.getLineName()==null || Objects.equals(leg.getLineName(), ln));
				}))
				.findFirst()
				.orElse(candidates.get(0));

			// 우선 전체 mapObj로 loadLane
			String mapObj = (chosen.getInfo() != null) ? chosen.getInfo().getMapObj() : null;
			log.debug("[polyline] leg={}, type={}, line={}, mapObj={}",
				leg.getOrder(), leg.getType(), leg.getLineName(), mapObj);
			List<RouteDetailDTO.PolylinePointDTO> segmentPolyline = loadLanePolyline(mapObj);
			log.debug("[polyline] loadLane points={}", segmentPolyline.size());

			// 0점이면: 이 leg에 해당하는 subPath의 lane.mapObj로 폴백 loadLane
			if (segmentPolyline.isEmpty() && chosen.getSubPath()!=null) {
				for (OdSayResponseDTO.SubPath sp : chosen.getSubPath()) {
					String t = (sp.getTrafficType()==1) ? "SUBWAY" : (sp.getTrafficType()==2) ? "BUS" : "WALKING";
					String ln = pickLineName(sp, t);
					if (Objects.equals(t, leg.getType()) &&
						(leg.getLineName()==null || Objects.equals(leg.getLineName(), ln))) {

						if (sp.getLane()!=null && !sp.getLane().isEmpty()) {
							String laneMapObj = sp.getLane().get(0).getMapObj(); // ★ lane.mapObj 사용
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

			// 클립 + 폴백
			List<RouteDetailDTO.PolylinePointDTO> legPolyline =
				clipPolylineForLeg(segmentPolyline, leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
			if (legPolyline == null || legPolyline.isEmpty()) {
				legPolyline = buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
			}

			// 간격 보강(직선 보강)
			if (legPolyline.size() < 30) { // 임계치 임의 선정
				legPolyline = densifyLine(legPolyline, 30.0); // 30m 간격으로 점 보강
			}

			return legPolyline;

		} catch (Exception ignore) {
			return buildPolylineFromStations(leg.getPath(), leg.getStartLat(), leg.getStartLng(), leg.getEndLat(), leg.getEndLng());
		}
	}

	/** path.getInfo().getMapObj()를 꺼내서 문자열 mapObj를 만든 다음,
	 * 문자열 버전에 그대로 위임(이미 Path 객체가 있고, 그 Path의 전체를 그리고 싶을때) 사용*/
	private List<RouteDetailDTO.PolylinePointDTO> loadLanePolyline(OdSayResponseDTO.Path path) {
		String mapObj = (path.getInfo() != null) ? path.getInfo().getMapObj() : null;
		return loadLanePolyline(mapObj);
	}

	/** mapObj로 loadLane 호출 (캐시 포함)
	 * - path의 mapObj가 비었거나 좌표가 0개일때 폴백을 직접 넘겨 호출
	 * */
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

	/** 하버사인 거리: 가장 가까운 점의 인덱스 찾는 함수 */
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
			double d = 2 * 6371000.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // meters
			if (d < best) { best = d; idx = i; }
		}
		return idx;
	}

	/** ODSay의 SubPath를 dgg의 Leg로 변환하는 함수 */
	private RouteDetailDTO.Leg toLeg(int order, OdSayResponseDTO.SubPath sp) {
		String type = (sp.getTrafficType() == 1) ? "SUBWAY"
			: (sp.getTrafficType() == 2) ? "BUS" : "WALKING";
		String lineName = pickLineName(sp, type);

		// 정류장/역 전체 path
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

	/** 저장된 이름/좌표가 비어있을 때만 지오코딩으로 보강 */
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
	 * route_info 레코드를 기반으로 leg의 전체 path를 재구성
	 * - 1) 좌표가 있으면 좌표로, 2) 없으면 지명으로 ODsay 호출
	 * - 3) 호출 결과의 subPath 중 type/lineName이 일치하는 것을 우선 사용
	 * - 4) 없으면 첫 subPath의 passStopList로 폴백
	 */
	private List<RouteDetailDTO.PathNodeDTO> reconstructPathForLeg(RouteDetailDTO.Leg leg) {
		try {
			List<OdSayResponseDTO.Path> candidates;
			if (leg.getStartLat() != null && leg.getStartLng() != null
				&& leg.getEndLat() != null && leg.getEndLng() != null) {
				candidates = findPathsBetweenCoords(
					leg.getStartLng(), leg.getStartLat(), // SX, SY (lng, lat)
					leg.getEndLng(), leg.getEndLat()      // EX, EY
				);
			} else if (leg.getStartPoint() != null && leg.getEndPoint() != null) {
				candidates = findPathsBetween(leg.getStartPoint(), leg.getEndPoint());
			} else {
				return Collections.emptyList();
			}

			// 우선순위: type/lineName 매칭되는 subPath
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

			// 폴백: 첫 경로의 첫 subPath
			OdSayResponseDTO.Path first = candidates.get(0);
			if (first.getSubPath() != null && !first.getSubPath().isEmpty()) {
				return convertStations(first.getSubPath().get(0));
			}
		} catch (Exception e) {
			// 무조건 최소 2개(출발/도착)라도 만들어 주는 폴백
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

	/** ODsay SubPath -> PathNodeDTO 리스트 변환 */
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

	/** 두 점 거리가 maxStepMeters보다 크면 그 사이에 균등 분할 점을 삽입(직선보간) */
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
}

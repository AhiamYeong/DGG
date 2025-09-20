package S13P21A305.dgg.route.service;

import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.global.external.dto.OdSayResponseDTO;
import S13P21A305.dgg.global.external.service.GeocodingService;
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
public class RouteServiceImpl implements RouteService {

	private final RestTemplate restTemplate;
	private final GeocodingService geocodingService;
	private final RouteCacheService cache;

	private final RouteLogRepository routeLogRepository;
	private final RouteInfoRepository routeInfoRepository;
	private final MemberRepository memberRepository;

	@Value("${odsay.api.key}")
	private String odsayApiKey;

	private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	/** 길찾기 -> 캐시에 요약 3개 올리고 + 메타 저장 */
	@Override
	public RouteResponseDTO findRoute(RouteRequestDTO routeRequestDTO) {
		List<String> waypoints = new ArrayList<>();
		waypoints.add(routeRequestDTO.getDepartureAddress());
		if (routeRequestDTO.getStopoverAddresses() != null && !routeRequestDTO.getStopoverAddresses().isEmpty()) {
			waypoints.addAll(routeRequestDTO.getStopoverAddresses());
		}
		waypoints.add(routeRequestDTO.getDestinationAddress());

		LocalDateTime depTime = LocalDateTime.parse(routeRequestDTO.getStartTime(), FMT);

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
			.timeTaken(shortestMinutes).arrivalTime(shortestArrival).fatigue(75) // 피로도는 임시로 적음
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

	/** redis에서 요약 경로 조회 */
	@Override
	public RecommendedRouteDTO getSummary(String routeKey) {
		RecommendedRouteDTO s = cache.getSummary(routeKey, RecommendedRouteDTO.class);
		if (s != null) return s;

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

	/** DB에서 상세 조회 */
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

	private int calculateTotalMetric(List<String> waypoints, Function<List<OdSayResponseDTO.Path>, OdSayResponseDTO.Path> pathSelector,
		Function<OdSayResponseDTO.Path, Integer> metricExtractor) {
		int total = 0;
		for (int i = 0; i < waypoints.size() - 1; i++) {
			List<OdSayResponseDTO.Path> paths = findPathsBetween(waypoints.get(i), waypoints.get(i + 1));
			OdSayResponseDTO.Path selected = pathSelector.apply(paths);
			total += metricExtractor.apply(selected);
		}

		return total;
	}

	private List<OdSayResponseDTO.Path> findPathsBetween(String startAddress, String endAddress) {
		Point startPoint = geocodingService.getCoordinates(startAddress);
		Point endPoint   = geocodingService.getCoordinates(endAddress);

		if (startPoint == null || endPoint == null) {
			throw new IllegalStateException("지오코딩 실패 - 주소를 좌표로 변환하지 못했습니다.");
		}

		final String url = "https://api.odsay.com/v1/api/searchPubTransPathT";
		URI uri = UriComponentsBuilder.fromHttpUrl(url)
			.queryParam("apiKey", odsayApiKey)
			.queryParam("SX", startPoint.lon()).queryParam("SY", startPoint.lat())
			.queryParam("EX", endPoint.lon()).queryParam("EY", endPoint.lat())
			.encode(StandardCharsets.UTF_8).build().toUri();

		OdSayResponseDTO res = restTemplate.getForObject(uri, OdSayResponseDTO.class);
		if (res == null || res.getResult() == null || res.getResult().getPath() == null || res.getResult().getPath().isEmpty()) {
			throw new IllegalStateException("길찾기 결과가 없습니다. [" + startAddress + " -> " + endAddress + "]");
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

	/* 상세 복구용 메타 - 캐시에 저장 */
	public record RouteMeta(
		String departure,
		String destination,
		List<String> stopovers,
		String departureTime,
		String option // 어떤 경로인지
	) {}

	/** 메타로 상세를 다시 구성해서 DB에 저장 - 길안내 시작*/
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

			// 선택된 경로의 subPath를 Leg로 변환
			if (selected.getSubPath() != null) {
				for (OdSayResponseDTO.SubPath sp : selected.getSubPath()) {
					RouteDetailDTO.Leg leg = toLeg(orderCounter++, sp);
					// 좌표가 없을 수 있어서 보강
					leg = enrichLegWithGeocoding(leg);

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

	private RouteDetailDTO.Leg toLeg(int order, OdSayResponseDTO.SubPath sp) {
		String type = (sp.getTrafficType() == 1) ? "SUBWAY"
			: (sp.getTrafficType() == 2) ? "BUS" : "WALKING";
		String lineName = pickLineName(sp, type);

		// 경유 좌표
		List<RouteDetailDTO.LatLngDTO> path = new ArrayList<>();
		if (sp.getPassStopList() != null && sp.getPassStopList().getStations() != null) {
			for (OdSayResponseDTO.Station st : sp.getPassStopList().getStations()) {
				path.add(RouteDetailDTO.LatLngDTO.builder()
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

	private RouteDetailDTO.Leg enrichLegWithGeocoding(RouteDetailDTO.Leg leg) {
		if (leg.getStartLat() == null || leg.getStartLng() == null) {
			Point p = geocodingService.getCoordinates(leg.getStartPoint());
			if (p != null) { leg.setStartLat(p.lat()); leg.setStartLng(p.lon()); }
		}
		if (leg.getEndLat() == null || leg.getEndLng() == null) {
			Point p = geocodingService.getCoordinates(leg.getEndPoint());
			if (p != null) { leg.setEndLat(p.lat()); leg.setEndLng(p.lon()); }
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
}

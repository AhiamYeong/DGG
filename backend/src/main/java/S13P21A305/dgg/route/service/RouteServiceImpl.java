package S13P21A305.dgg.route.service;

import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.global.external.dto.OdSayResponseDTO;
import S13P21A305.dgg.global.external.service.GeocodingService;
import S13P21A305.dgg.route.dto.RecommendedRouteDTO;
import S13P21A305.dgg.route.dto.RouteRequestDTO;
import S13P21A305.dgg.route.dto.RouteResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

@Service
public class RouteServiceImpl implements RouteService {

	private final RestTemplate restTemplate;
	private final GeocodingService geocodingService;

	@Value("${odsay.api.key}")
	private String odsayApiKey;

	public RouteServiceImpl(RestTemplate restTemplate, GeocodingService geocodingService) {
		this.restTemplate = restTemplate;
		this.geocodingService = geocodingService;
	}

	@Override
	public RouteResponseDTO findRoute(RouteRequestDTO routeRequestDTO) {
		// 경유지가 0~2개 - 모든 경우를 같은 로직으로 처리 - 하나의 리스트에 모든 지점 추가
		List<String> waypoints = new ArrayList<>(); // 전체 경로 지점([출발, 경유, 도착])

		waypoints.add(routeRequestDTO.getDepartureAddress()); // 출발지 추가
		if (routeRequestDTO.getStopoverAddresses() != null && !routeRequestDTO.getStopoverAddresses().isEmpty()) {
			waypoints.addAll(routeRequestDTO.getStopoverAddresses());
		}
		waypoints.add(routeRequestDTO.getDestinationAddress()); // 도착지 추가

		List<RecommendedRouteDTO> recommendedRoutes = new ArrayList<>();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		LocalDateTime departureDateTime = LocalDateTime.parse(routeRequestDTO.getStartTime(), formatter);

		// 최소 환승 경로 계산
		int minTransferTime = calculateTotalMetric(waypoints, this::findMinTransferPathSegment, path -> path.getInfo().getTotalTime()); // 구간별 최소환승 경로 찾고, 그 경로들의 소요시간을 합산
		String minTransferArrival = departureDateTime.plusMinutes(minTransferTime).format(formatter); // 출발 시간 + 총 소요시간 = 최종 도착 시간
		recommendedRoutes.add(RecommendedRouteDTO.builder()
			.routeId(3L)
			.name("최소 환승")
			.timeTaken(minTransferTime)
			.arrivalTime(minTransferArrival)
			.fatigue(60) // 피로도는 임의 값으로 설정
			.build());

		// 최종 응답 DTO 생성
		return RouteResponseDTO.builder()
			.departureAddress(routeRequestDTO.getDepartureAddress())
			.destinationAddress(routeRequestDTO.getDestinationAddress())
			.stopoverAddresses(routeRequestDTO.getStopoverAddresses())
			.departureTime(routeRequestDTO.getStartTime())
			.destinationTime(minTransferArrival) // 최소 환승의 경우에 소요되는 시간을 대표 도착 시간으로 설정 -> 임의로 설정
			.recommendedRoutes(recommendedRoutes)
			.build();
	}

	/**
	 * @param waypoints 전체 경로 지점([출발, 경유, 도착])
	 * @param pathSelector 어떤 기준으로 경로를 선택할지에 대한 메서드(최단경로? 최소환승?)
	 * @param metricExtractor 선택된 경로에서 어떤 값을 추출할지에 대한 메서드
	 * @return 모든 구간의 합을 합산한 최종 결과
	 * */
	private int calculateTotalMetric(List<String> waypoints, Function<List<OdSayResponseDTO.Path>, OdSayResponseDTO.Path> pathSelector, Function<OdSayResponseDTO.Path, Integer> metricExtractor) {
		int totalMetric = 0;

		// 전체 경로 리스트를 돌면서 각 구간을 합산 함
		for (int i = 0; i < waypoints.size() - 1; i++) {
			// 현재 구간(경유지가 있을 경우, 출발지 -> 경유지1)의 모든 경로의 후보를 가져옴
			List<OdSayResponseDTO.Path> paths = findPathsBetween(waypoints.get(i), waypoints.get(i + 1));
			OdSayResponseDTO.Path selectedPath = pathSelector.apply(paths);
			totalMetric += metricExtractor.apply(selectedPath);
		}
		return totalMetric;
	}

	/**
	 * ODSay API를 호출하여 두 지점 간의 모든 경로를 반환
	 */
	private List<OdSayResponseDTO.Path> findPathsBetween(String startAddress, String endAddress) {
		// Geocoding 호출해서 좌표 맞춰주고
		Point startPoint = geocodingService.getCoordinates(startAddress);
		Point endPoint = geocodingService.getCoordinates(endAddress);

		// ODSay API 호출
		final String url = "https://api.odsay.com/v1/api/searchPubTransPathT";
		URI uri = UriComponentsBuilder.fromHttpUrl(url)
			.queryParam("apiKey", odsayApiKey)
			.queryParam("SX", startPoint.lon()).queryParam("SY", startPoint.lat())
			.queryParam("EX", endPoint.lon()).queryParam("EY", endPoint.lat())
			.encode(StandardCharsets.UTF_8).build().toUri();

		OdSayResponseDTO response = restTemplate.getForObject(uri, OdSayResponseDTO.class);

		if (response == null || response.getResult() == null || response.getResult().getPath() == null || response.getResult().getPath().isEmpty()) {
			throw new IllegalStateException("길찾기 결과를 가져올 수 없습니다. [" + startAddress + " -> " + endAddress + "]");
		}
		return response.getResult().getPath();
	}

	/**
	 * 경로 리스트에서 최소 환승 경로 선택
	 */
	private OdSayResponseDTO.Path findMinTransferPathSegment(List<OdSayResponseDTO.Path> paths) {
		return paths.stream()
			.min(Comparator.comparingInt(p -> p.getInfo().getBusTransitCount() + p.getInfo().getSubwayTransitCount()))
			.orElseThrow(() -> new IllegalStateException("최소 환승 경로를 찾을 수 없습니다."));
	}
}


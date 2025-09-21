package S13P21A305.dgg.bookmark.service;

import S13P21A305.dgg.bookmark.entity.BookmarkRoute;
import S13P21A305.dgg.bookmark.entity.BookmarkRouteInfo;
import S13P21A305.dgg.bookmark.repository.BookmarkRouteInfoRepository;
import S13P21A305.dgg.bookmark.repository.BookmarkRouteRepository;
import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.global.external.dto.OdSayResponseDTO;
import S13P21A305.dgg.global.external.service.GeocodingService;
import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.repository.MemberRepository;
import S13P21A305.dgg.bookmark.dto.BookmarkRouteSaveRequestDTO;
import S13P21A305.dgg.route.dto.RouteDetailDTO;
import S13P21A305.dgg.route.dto.RouteMetaDTO;
import S13P21A305.dgg.route.entity.*;
import S13P21A305.dgg.route.repository.*;
import S13P21A305.dgg.route.service.RouteCacheService;
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

@RequiredArgsConstructor
@Service
public class BookmarkServiceImpl implements BookmarkService {

	private final MemberRepository memberRepository;
	private final BookmarkRouteRepository bookmarkRouteRepository;
	private final BookmarkRouteInfoRepository bookmarkRouteInfoRepository;

	private final RouteLogRepository routeLogRepository;
	private final RouteInfoRepository routeInfoRepository;

	private final RouteCacheService cache;
	private final GeocodingService geocodingService;
	private final RestTemplate restTemplate;

	@Value("${odsay.api.key}")
	private String odsayApiKey;

	private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	@Override
	@Transactional
	public Long saveRouteBookmark(Integer memberId, BookmarkRouteSaveRequestDTO req) {
		Member member = memberRepository.findById(memberId)
			.orElseThrow(() -> new NoSuchElementException("회원 없음: " + memberId));

		BookmarkRoute br = new BookmarkRoute();
		br.setMember(member);

		// 이름값이 비어있으면 기본 값으로 설정
		String displayName = (req.getName() != null && !req.getName().isBlank()) ? req.getName() : "내 즐겨찾기 경로";
		br.setName(displayName);

		br.setDepartureName(req.getDepartureName());
		br.setDestinationName(req.getDestinationName());

		bookmarkRouteRepository.save(br);

		// routeId가 들어오면 route_info 테이블에서 복사
		if (req.getRouteId() != null) {
			copyFromRouteInfo(br.getId(), req.getRouteId());

			return br.getId();
		}

		// routeKey가 들어오면 캐시 meta로 ODSay 다시 조회해서 세부구간 저장
		if (req.getRouteKey() != null && !req.getRouteKey().isBlank()) {
			// 캐시에서 메타 복구
			RouteMetaDTO meta = cache.getMeta(req.getRouteKey(), RouteMetaDTO.class);
			if (meta == null) {
				throw new IllegalStateException("캐시 메타 없음: " + req.getRouteKey());
			}
			// 메타로 상세 다시 구성
			RouteDetailDTO detail = buildDetailFromOdsay(meta);
			// 다시 구성한 상세를 bookmark_route_info에 저장
			saveFromDetail(br.getId(), detail);

			// 둘 다 없으면 요약만 저장
			return br.getId();
		}

		return br.getId();
	}

	// route_info에서 bookmark_route_info로 복사
	private void copyFromRouteInfo(Long bookmarkId, Long routeId) {
		List<RouteInfo> infos = routeInfoRepository.findAllByRouteIdOrderByOrder(routeId);
		for (RouteInfo ri : infos) {
			BookmarkRouteInfo bri = new BookmarkRouteInfo();

			// 복합키 설정
			bri.setBookmarkId(bookmarkId);
			bri.setOrder(ri.getOrder());

			bri.setDepartureName(ri.getDeparture());
			bri.setDestinationName(ri.getDestination());
			bri.setType(ri.getType());
			bri.setLineName(ri.getLineName());
			bri.setWalkDistance(ri.getWalkDistance());

			bri.setStartLat(ri.getStartLat());
			bri.setStartLng(ri.getStartLng());
			bri.setEndLat(ri.getEndLat());
			bri.setEndLng(ri.getEndLng());

			bookmarkRouteInfoRepository.save(bri);
		}
	}

	// 캐시 메타로 ODSay를 구간마다 호출해서 상세 다시 구성 - 길찾기 로직과 동일
	private RouteDetailDTO buildDetailFromOdsay(RouteMetaDTO meta) {
		// 출발 - 경유 - 도착 지점에 해당하는 목록 생성
		List<String> waypoints = new ArrayList<>();
		waypoints.add(meta.getDeparture());
		if (meta.getStopovers() != null && !meta.getStopovers().isEmpty()) {
			waypoints.addAll(meta.getStopovers());
		}
		waypoints.add(meta.getDestination());

		List<RouteDetailDTO.Leg> legs = new ArrayList<>();
		int totalMinutes = 0;
		int orderCounter = 1;

		for (int i = 0; i < waypoints.size() - 1; i++) {
			List<OdSayResponseDTO.Path> paths = findPathsBetween(waypoints.get(i), waypoints.get(i + 1));
			OdSayResponseDTO.Path selected = selectByOption(meta.getOption(), paths);
			totalMinutes += selected.getInfo().getTotalTime();

			if (selected.getSubPath() != null) {
				for (OdSayResponseDTO.SubPath sp : selected.getSubPath()) {
					RouteDetailDTO.Leg leg = toLeg(orderCounter++, sp);
					leg = enrichLegWithGeocoding(leg);
					legs.add(leg);
				}
			}
		}

		String arrival = LocalDateTime.parse(meta.getDepartureTime(), FMT)
			.plusMinutes(totalMinutes).format(FMT);

		return RouteDetailDTO.builder()
			.totalTime(totalMinutes)
			.departureTime(meta.getDepartureTime())
			.arrivalTime(arrival)
			.fatigue(0)
			.data(legs)
			.build();
	}

	// ODSay 호출: 출/도착지 주소 -> 좌표 -> API 호출 -> Path 목록 반환
	private List<OdSayResponseDTO.Path> findPathsBetween(String startAddress, String endAddress) {
		// 주소 -> 좌표로 변환
		Point s = geocodingService.getCoordinates(startAddress);
		Point e = geocodingService.getCoordinates(endAddress);
		if (s == null || e == null) throw new IllegalStateException("지오코딩 실패");

		URI uri = UriComponentsBuilder.fromHttpUrl("https://api.odsay.com/v1/api/searchPubTransPathT")
			.queryParam("apiKey", odsayApiKey)
			.queryParam("SX", s.lon()).queryParam("SY", s.lat())
			.queryParam("EX", e.lon()).queryParam("EY", e.lat())
			.encode(StandardCharsets.UTF_8).build().toUri();

		OdSayResponseDTO res = restTemplate.getForObject(uri, OdSayResponseDTO.class);
		if (res == null || res.getResult() == null || res.getResult().getPath() == null
			|| res.getResult().getPath().isEmpty()) {
			throw new IllegalStateException("길찾기 결과 없음");
		}
		return res.getResult().getPath();
	}

	// 옵션에 따라 Path 선택
	private OdSayResponseDTO.Path selectByOption(String option, List<OdSayResponseDTO.Path> paths) {
		if ("MIN_TRANSFER".equalsIgnoreCase(option)) {
			return paths.stream()
				.min(Comparator.comparingInt(p -> p.getInfo().getBusTransitCount() + p.getInfo().getSubwayTransitCount()))
				.orElseThrow();
		}
		// 기본: 최단거리
		return paths.stream()
			.min(Comparator.comparingInt(p -> p.getInfo().getTotalDistance()))
			.orElseThrow();
	}

	// ODSay SubPath -> Leg로 변환
	private RouteDetailDTO.Leg toLeg(int order, OdSayResponseDTO.SubPath sp) {
		String type = (sp.getTrafficType() == 1) ? "SUBWAY"
			: (sp.getTrafficType() == 2) ? "BUS" : "WALKING";

		String lineName = null;
		if (sp.getLane() != null && !sp.getLane().isEmpty()) {
			OdSayResponseDTO.Lane first = sp.getLane().get(0);
			if ("SUBWAY".equals(type)) lineName = first.getName();
			else if ("BUS".equals(type)) lineName = first.getBusNo();
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
			.build();
	}

	private RouteDetailDTO.Leg enrichLegWithGeocoding(RouteDetailDTO.Leg leg) {
		if ((leg.getStartLat() == null || leg.getStartLng() == null)
			&& leg.getStartPoint() != null && !leg.getStartPoint().isBlank()) {
			Point p = geocodingService.getCoordinates(leg.getStartPoint());
			if (p != null) {
				leg.setStartLat(p.lat());
				leg.setStartLng(p.lon());
			}
		}
		// 끝 좌표가 없을 때만 시도
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

	private RouteType mapToRouteType(String type) {
		if (type == null) return null;
		switch (type.toUpperCase()) {
			case "SUBWAY": return RouteType.SUBWAY;
			case "BUS": return RouteType.BUS;
			case "WALK":
			case "WALKING": return RouteType.WALKING;
			default: throw new IllegalArgumentException("Unknown type: " + type);
		}
	}

	// RouteDetailDTO를 bookmark_route_info에 저장
	private void saveFromDetail(Long bookmarkId, RouteDetailDTO detail) {
		for (RouteDetailDTO.Leg leg : detail.getData()) {
			BookmarkRouteInfo bri = new BookmarkRouteInfo();
			bri.setBookmarkId(bookmarkId);
			bri.setOrder(leg.getOrder());
			bri.setDepartureName(leg.getStartPoint());
			bri.setDestinationName(leg.getEndPoint());
			bri.setType(mapToRouteType(leg.getType()));
			bri.setLineName(leg.getLineName());
			bri.setWalkDistance(null);
			bri.setStartLat(leg.getStartLat());
			bri.setStartLng(leg.getStartLng());
			bri.setEndLat(leg.getEndLat());
			bri.setEndLng(leg.getEndLng());

			bookmarkRouteInfoRepository.save(bri);
		}
	}
}

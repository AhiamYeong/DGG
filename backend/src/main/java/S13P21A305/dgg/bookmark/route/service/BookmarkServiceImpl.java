package S13P21A305.dgg.bookmark.route.service;

import S13P21A305.dgg.bookmark.route.dto.BookmarkRouteDetailDTO;
import S13P21A305.dgg.bookmark.route.dto.BookmarkRouteListDTO;
import S13P21A305.dgg.bookmark.route.dto.BookmarkRouteSaveRequestDTO;
import S13P21A305.dgg.bookmark.route.entity.BookmarkRoute;
import S13P21A305.dgg.bookmark.route.entity.BookmarkRouteInfo;
import S13P21A305.dgg.bookmark.route.repository.BookmarkRouteInfoRepository;
import S13P21A305.dgg.bookmark.route.repository.BookmarkRouteRepository;
import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.global.external.dto.OdSayResponseDTO;
import S13P21A305.dgg.global.external.service.GeocodingService;
import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.repository.MemberRepository;
import S13P21A305.dgg.route.dto.BusEtaDTO;
import S13P21A305.dgg.route.dto.RouteDetailDTO;
import S13P21A305.dgg.route.dto.RouteMetaDTO;
import S13P21A305.dgg.route.entity.RouteInfo;
import S13P21A305.dgg.route.entity.RouteType;
import S13P21A305.dgg.route.repository.RouteInfoRepository;
import S13P21A305.dgg.route.repository.RouteLogRepository;
import S13P21A305.dgg.route.service.BusRealtimeService;
import S13P21A305.dgg.route.service.RouteCacheService;
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

/**
 * 즐겨찾기(경로) 저장/조회 서비스
 * - DB에는 정적 구간만 저장 (time_taken / 좌표 / 라인명 / 버스 식별자 등)
 * - 조회 시 realtime=true면 버스 구간은 ODsay 실시간으로 대기시간(etaMin) 붙여서 timeTaken에 더함
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class BookmarkServiceImpl implements BookmarkService {

	private final MemberRepository memberRepository;
	private final BookmarkRouteRepository bookmarkRouteRepository;
	private final BookmarkRouteInfoRepository bookmarkRouteInfoRepository;

	// 아래 두 리포지토리는 routeId -> 즐겨찾기로 복사할 때만 사용
	private final RouteLogRepository routeLogRepository;
	private final RouteInfoRepository routeInfoRepository;

	private final BusRealtimeService busRealtimeService;

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

		String displayName = (req.getName() != null && !req.getName().isBlank())
			? req.getName() : "내 즐겨찾기 경로";
		br.setName(displayName);

		br.setDepartureName(req.getDepartureName());
		br.setDestinationName(req.getDestinationName());
		bookmarkRouteRepository.save(br);

		// routeId가 있으면 과거 route_info를 그대로 복사
		if (req.getRouteId() != null) {
			copyFromRouteInfo(br.getId(), req.getRouteId());
			return br.getId();
		}

		// routeKey가 있으면 meta로 ODsay 다시 조회 -> bookmark_route_info에 "시간/버스ID까지" 저장
		if (req.getRouteKey() != null && !req.getRouteKey().isBlank()) {
			RouteMetaDTO meta = cache.getMeta(req.getRouteKey(), RouteMetaDTO.class);
			if (meta == null) {
				throw new IllegalStateException("캐시 메타 없음: " + req.getRouteKey());
			}
			saveFromMetaWithOdsay(br.getId(), meta);
			return br.getId();
		}

		// (예외경로) 아무 것도 없으면 빈 즐겨찾기만 만들어짐
		return br.getId();
	}

	/**
	 * ODsay의 서브패스를 보면서 바로 bookmark_route_info 저장
	 * - time_taken: SubPath.sectionTime 그대로
	 * - BUS: busRouteId / busStationId 같이 저장(실시간 ETA에 필요)
	 */
	private void saveFromMetaWithOdsay(Long bookmarkId, RouteMetaDTO meta) {
		List<String> waypoints = new ArrayList<String>();
		waypoints.add(meta.getDeparture());
		if (meta.getStopovers() != null && !meta.getStopovers().isEmpty()) {
			waypoints.addAll(meta.getStopovers());
		}
		waypoints.add(meta.getDestination());

		int order = 1;

		for (int i = 0; i < waypoints.size() - 1; i++) {
			List<OdSayResponseDTO.Path> paths = findPathsBetween(waypoints.get(i), waypoints.get(i + 1));
			OdSayResponseDTO.Path selected = selectByOption(meta.getOption(), paths);
			if (selected.getSubPath() == null) continue;

			for (OdSayResponseDTO.SubPath sp : selected.getSubPath()) {
				String type = (sp.getTrafficType() == 1) ? "SUBWAY"
					: (sp.getTrafficType() == 2) ? "BUS" : "WALKING";

				String lineName = null;
				String busRouteId = null;
				String busStationId = null;

				if (sp.getLane() != null && !sp.getLane().isEmpty()) {
					OdSayResponseDTO.Lane first = sp.getLane().get(0);
					if ("SUBWAY".equals(type)) {
						lineName = first.getName();
					} else if ("BUS".equals(type)) {
						lineName = first.getBusNo();
						// 노선 고유 ID
						if (first.getBusID() != null) busRouteId = String.valueOf(first.getBusID());
					}
				}

				Double startLat = sp.getStartY();
				Double startLng = sp.getStartX();
				Double endLat = sp.getEndY();
				Double endLng = sp.getEndX();

				// 정류장 ID (탑승 정류장 추정: 첫 스테이션)
				if ("BUS".equals(type)
					&& sp.getPassStopList() != null
					&& sp.getPassStopList().getStations() != null
					&& !sp.getPassStopList().getStations().isEmpty()) {

					OdSayResponseDTO.Station firstSt = sp.getPassStopList().getStations().get(0);
					if (firstSt != null && firstSt.getStationID() != null) {
						busStationId = String.valueOf(firstSt.getStationID());
					}
				}

				BookmarkRouteInfo bri = new BookmarkRouteInfo();
				bri.setBookmarkId(bookmarkId);
				bri.setOrder(order++);
				bri.setDepartureName(sp.getStartName());
				bri.setDestinationName(sp.getEndName());
				bri.setType(mapToRouteType(type));
				bri.setLineName(lineName);
				bri.setWalkDistance(null);
				bri.setStartLat(startLat);
				bri.setStartLng(startLng);
				bri.setEndLat(endLat);
				bri.setEndLng(endLng);
				// 시간(정적)
				bri.setTimeTaken(sp.getSectionTime());
				// BUS 식별자
				bri.setBusRouteId(busRouteId);
				bri.setBusStationId(busStationId);

				bookmarkRouteInfoRepository.save(bri);
			}
		}
	}

	/** route_info → bookmark_route_info 복사 */
	private void copyFromRouteInfo(Long bookmarkId, Long routeId) {
		List<RouteInfo> infos = routeInfoRepository.findAllByRouteIdOrderByOrder(routeId);
		for (int i = 0; i < infos.size(); i++) {
			RouteInfo ri = infos.get(i);
			BookmarkRouteInfo bri = new BookmarkRouteInfo();
			bri.setBookmarkId(bookmarkId);
			bri.setOrder(ri.getOrder());
			bri.setDepartureName(ri.getDeparture());
			bri.setDestinationName(ri.getDestination());
			bri.setType(ri.getType());
			bri.setLineName(ri.getLineName());
			bri.setWalkDistance(ri.getWalkDistance());
			bri.setTimeTaken(ri.getTimeTaken());
			bri.setStartLat(ri.getStartLat());
			bri.setStartLng(ri.getStartLng());
			bri.setEndLat(ri.getEndLat());
			bri.setEndLng(ri.getEndLng());
			// 과거 경로 복사엔 bus ids가 없을 수 있음(실시간 붙지 않을 수 있음)
			bookmarkRouteInfoRepository.save(bri);
		}
	}

	/** 즐겨찾기 상세 조회 (realtime=true면 BUS ETA 반영) */
	@Override
	@Transactional(readOnly = true)
	public BookmarkRouteDetailDTO getBookmarkDetail(Long bookmarkRouteId, Integer memberId, boolean realtime, String departAt) {
		BookmarkRoute br = bookmarkRouteRepository.findById(bookmarkRouteId)
			.orElseThrow(() -> new NoSuchElementException("즐겨찾기 경로 없음: " + bookmarkRouteId));

		if (memberId != null && br.getMember() != null
			&& !Objects.equals(br.getMember().getId(), memberId)) {
			throw new SecurityException("권한이 없습니다.");
		}

		List<BookmarkRouteInfo> infos =
			bookmarkRouteInfoRepository.findAllByBookmarkIdOrderByOrder(bookmarkRouteId);

		LocalDateTime departTime = (departAt != null && !departAt.isBlank())
			? LocalDateTime.parse(departAt, FMT)
			: LocalDateTime.now();

		List<RouteDetailDTO.Leg> legs = new ArrayList<RouteDetailDTO.Leg>();
		int totalMinutes = 0;
		LocalDateTime cursor = departTime;

		for (int idx = 0; idx < infos.size(); idx++) {
			BookmarkRouteInfo bi = infos.get(idx);

			RouteDetailDTO.Leg leg = RouteDetailDTO.Leg.builder()
				.order(bi.getOrder())
				.type(bi.getType() != null ? bi.getType().name() : null)
				.lineName(bi.getLineName())
				.startPoint(bi.getDepartureName())
				.endPoint(bi.getDestinationName())
				.startLat(bi.getStartLat())
				.startLng(bi.getStartLng())
				.endLat(bi.getEndLat())
				.endLng(bi.getEndLng())
				.build();

			int staticMinutes = safeInt(bi.getTimeTaken(), 0);

			Integer etaMin = null;
			int waitMinutes = 0;

			if (realtime && bi.getType() == RouteType.BUS
				&& bi.getBusRouteId() != null && bi.getBusStationId() != null) {
				log.info("[BKMRK] try BUS ETA: order={} lineName={} stationId={} routeId={} realtime={}",
					bi.getOrder(), bi.getLineName(), bi.getBusStationId(), bi.getBusRouteId(), realtime);
				try {
					Optional<BusEtaDTO> etaOpt = busRealtimeService.getEta(bi.getBusStationId(), bi.getBusRouteId());

					// ✅ Optional 안전 해제로 NPE 방지
					Integer etaMaybe = etaOpt.map(S13P21A305.dgg.route.dto.BusEtaDTO::getEtaMin).orElse(null);
					if (etaMaybe != null) {
						log.info("[BKMRK] ETA OK: stationId={} routeId={} etaMin={}",
							bi.getBusStationId(), bi.getBusRouteId(), etaMaybe);
						etaMin = etaMaybe;
						waitMinutes = Math.max(0, etaMin);
					} else {
						log.info("[BKMRK] ETA MISS: stationId={} routeId={}",
							bi.getBusStationId(), bi.getBusRouteId());
					}
				} catch (Exception e) {
					log.warn("BUS ETA 조회 실패 stationId={}, routeId={}, msg={}",
						bi.getBusStationId(), bi.getBusRouteId(), e.getMessage());
				}
			}

			int legMinutes = staticMinutes + waitMinutes;
			leg.setTimeTaken(legMinutes);
			leg.setEtaMin(etaMin); // DTO에 etaMin 필드 있는지 확인

			cursor = cursor.plusMinutes(legMinutes);
			totalMinutes += legMinutes;

			leg = enrichLegWithGeocodingIfNeeded(leg);

			if (leg.getPath() == null) {
				log.info("[BKMRK] path is NULL: order={} type={} lineName={}",
					bi.getOrder(), bi.getType(), bi.getLineName());
			}

			legs.add(leg);
		}

		String arrival = departTime.plusMinutes(totalMinutes).format(FMT);

		return BookmarkRouteDetailDTO.builder()
			.bookmarkRouteId(bookmarkRouteId)
			.name(br.getName())
			.totalTime(totalMinutes)
			.arrivalTime(arrival)
			.data(legs)
			.build();
	}

	@Override
	@Transactional(readOnly = true)
	public List<BookmarkRouteListDTO> getBookmarkList(Integer memberId) {
		return bookmarkRouteRepository.findAllByMember_IdOrderById(memberId)
			.stream()
			.map(br -> BookmarkRouteListDTO.builder()
				.bookmarkRouteId(br.getId())
				.name(br.getName())
				.departureName(br.getDepartureName())
				.destinationName(br.getDestinationName())
				.createdAt(br.getCreatedAt() != null ? br.getCreatedAt().format(FMT) : null)
				.build())
			.toList();
	}

	@Override
	@Transactional
	public void renameBookmark(Long bookmarkRouteId, Integer memberId, String newName) {
		BookmarkRoute br = bookmarkRouteRepository.findById(bookmarkRouteId)
			.orElseThrow(() -> new NoSuchElementException("즐겨찾기 목록에 없음"));

		Integer ownerId = (br.getMember() != null) ? br.getMember().getId() : null;
		if (!Objects.equals(ownerId, memberId)) {
			throw new SecurityException("권한이 없습니다.");
		}
		if (newName == null || newName.isBlank()) {
			throw new IllegalStateException("수정하려는 경로 이름을 입력해주세요.");
		}
		br.setName(newName);
	}

	@Override
	@Transactional
	public void deleteBookmark(Long bookmarkRouteId, Integer memberId) {
		long result = bookmarkRouteRepository.deleteByIdAndMember_Id(bookmarkRouteId, memberId);
		if (result == 0) {
			throw new NoSuchElementException("삭제 대상이 없거나 권한이 없습니다.");
		}
	}

	private int safeInt(Integer v, int def) {
		return v != null ? v : def;
	}

	// 좌표가 비어있다면 지오코딩으로 보충 (최소 변경)
	private RouteDetailDTO.Leg enrichLegWithGeocodingIfNeeded(RouteDetailDTO.Leg leg) {
		if ((leg.getStartLat() == null || leg.getStartLng() == null)
			&& leg.getStartPoint() != null && !leg.getStartPoint().isBlank()) {
			Point p = geocodingService.getCoordinates(leg.getStartPoint());
			if (p != null) { leg.setStartLat(p.lat()); leg.setStartLng(p.lon()); }
		}
		if ((leg.getEndLat() == null || leg.getEndLng() == null)
			&& leg.getEndPoint() != null && !leg.getEndPoint().isBlank()) {
			Point p = geocodingService.getCoordinates(leg.getEndPoint());
			if (p != null) { leg.setEndLat(p.lat()); leg.setEndLng(p.lon()); }
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

	// ODsay 호출: 주소 -> 좌표 -> searchPubTransPathT
	private List<OdSayResponseDTO.Path> findPathsBetween(String startAddress, String endAddress) {
		Point s = geocodingService.getCoordinates(startAddress);
		Point e = geocodingService.getCoordinates(endAddress);
		if (s == null || e == null) throw new IllegalStateException("지오코딩 실패");

		URI uri = UriComponentsBuilder.fromHttpUrl("https://api.odsay.com/v1/api/searchPubTransPathT")
			.queryParam("apiKey", odsayApiKey)
			.queryParam("SX", s.lon()).queryParam("SY", s.lat())
			.queryParam("EX", e.lon()).queryParam("EY", e.lat())
			.encode(StandardCharsets.UTF_8).build().toUri();

		OdSayResponseDTO res = restTemplate.getForObject(uri, OdSayResponseDTO.class);
		if (res == null || res.getResult() == null
			|| res.getResult().getPath() == null
			|| res.getResult().getPath().isEmpty()) {
			throw new IllegalStateException("길찾기 결과 없음");
		}
		return res.getResult().getPath();
	}

	// 옵션별 경로 선택 (최소 환승 vs 최단거리)
	private OdSayResponseDTO.Path selectByOption(String option, List<OdSayResponseDTO.Path> paths) {
		if ("MIN_TRANSFER".equalsIgnoreCase(option)) {
			return paths.stream()
				.min(Comparator.comparingInt(p -> p.getInfo().getBusTransitCount() + p.getInfo().getSubwayTransitCount()))
				.orElseThrow();
		}
		return paths.stream()
			.min(Comparator.comparingInt(p -> p.getInfo().getTotalDistance()))
			.orElseThrow();
	}
}

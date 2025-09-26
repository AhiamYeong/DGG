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

import java.lang.reflect.Method;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RequiredArgsConstructor
@Service
@Slf4j
public class BookmarkServiceImpl implements BookmarkService {

	private final MemberRepository memberRepository;
	private final BookmarkRouteRepository bookmarkRouteRepository;
	private final BookmarkRouteInfoRepository bookmarkRouteInfoRepository;

	private final RouteLogRepository routeLogRepository;
	private final RouteInfoRepository routeInfoRepository;

	private final BusRealtimeService busRealtimeService;

	private final RouteCacheService cache;
	private final GeocodingService geocodingService;
	private final RestTemplate restTemplate;

	private final ObjectMapper objectMapper;

	@Value("${odsay.api.key}")
	private String odsayApiKey;

	private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	/**
	 * 새 북마크 생성 후, 입력 케이스 분기
	 * - routeId가 있으면 route_info 복사
	 * - routeKey가 있으면 캐시에서 RouteMetaDTO를 꺼내 ODSay 다시 조회 -> bookmark_route_info 저장
	 * - 둘 다 없으면 빈 북마크 저장
	 * */
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

		// routeId가 있으면 과거 route_info를 복사
		if (req.getRouteId() != null) {
			copyFromRouteInfo(br.getId(), req.getRouteId());
			return br.getId();
		}

		// routeKey가 있으면 meta로 ODsay 다시 조회 -> bookmark_route_info에 저장
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
	 * - path_json: loadLane → 클립 → (비면) passStopList → densify → JSON
	 */
	private void saveFromMetaWithOdsay(Long bookmarkId, RouteMetaDTO meta) {
		List<String> waypoints = new ArrayList<>();
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

			String mapObj = (selected.getInfo() != null) ? selected.getInfo().getMapObj() : null;

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
						// 노선의 고유 ID
						if (first.getBusID() != null) busRouteId = String.valueOf(first.getBusID());
					}
				}

				Double startLat = sp.getStartY();
				Double startLng = sp.getStartX();
				Double endLat = sp.getEndY();
				Double endLng = sp.getEndX();

				// 정류장 ID (ETA 조회용)
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
				bri.setTimeTaken(sp.getSectionTime());

				// BUS 식별자
				bri.setBusRouteId(busRouteId);
				bri.setBusStationId(busStationId);

				try {
					String pathJson = buildPathJsonFromSubPath(sp, mapObj);
					bri.setPathJson(pathJson);
				} catch (Exception e) {
					log.info("[BKMRK] build path failed: order={} type={} lineName={} msg={}",
						bri.getOrder(), bri.getType(), bri.getLineName(), e.getMessage());
				}

				bookmarkRouteInfoRepository.save(bri);
			}
		}
	}

	/** route_info를 동일한 순서/속성으로 bookmark_route_info로 복사 */
	private void copyFromRouteInfo(Long bookmarkId, Long routeId) {
		List<RouteInfo> infos = routeInfoRepository.findAllByRouteIdOrderByOrder(routeId);
		for (RouteInfo ri : infos) {
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

			// path_json 시도: 해당 레그에 가장 잘 맞는 SubPath를 찾아 폴리라인을 위한 좌표 생성
			try {
				List<OdSayResponseDTO.Path> cands = findPathsBetween(ri.getDeparture(), ri.getDestination());
				OdSayResponseDTO.Path chosen = cands.get(0);
				String mapObj = (chosen.getInfo()!=null) ? chosen.getInfo().getMapObj() : null;

				if (chosen.getSubPath()!=null) {
					for (OdSayResponseDTO.SubPath sp : chosen.getSubPath()) {
						String t = (sp.getTrafficType()==1) ? "SUBWAY" : (sp.getTrafficType()==2) ? "BUS" : "WALKING";
						String ln = null;
						if (sp.getLane()!=null && !sp.getLane().isEmpty()) {
							OdSayResponseDTO.Lane first = sp.getLane().get(0);
							ln = "SUBWAY".equals(t) ? first.getName() : "BUS".equals(t) ? first.getBusNo() : null;
						}
						if (ri.getType()!=null
							&& t.equals(ri.getType().name())
							&& Objects.equals(ri.getLineName(), ln)) {
							String pathJson = buildPathJsonFromSubPath(sp, mapObj);
							bri.setPathJson(pathJson);
							break;
						}
					}
				}

				// SubPath 매칭이 실패했다면 마지막 폴백: loadLane 전체를 출발/도착으로만 잘라 사용
				if (bri.getPathJson()==null || bri.getPathJson().isBlank()) {
					if (mapObj!=null && !mapObj.isBlank()) {
						List<double[]> seg = loadLanePolyline(mapObj);
						List<double[]> clipped = clipByEndpoints(seg, ri.getStartLat(), ri.getStartLng(), ri.getEndLat(), ri.getEndLng());
						if (clipped.isEmpty()) clipped = seg;
						if (clipped!=null && !clipped.isEmpty()) {
							if (clipped.size()<30) clipped = densify(clipped, 30.0);
							bri.setPathJson(toPathJson(clipped));
						}
					}
				}
			} catch (Exception e) {
				log.info("[BKMRK] copy path_json build fail routeId={} order={} msg={}",
					ri.getRouteId(), ri.getOrder(), e.getMessage());
			}

			bookmarkRouteInfoRepository.save(bri);
		}
	}

	/** 즐겨찾기 상세 조회 */
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

		List<RouteDetailDTO.Leg> legs = new ArrayList<>();
		int totalMinutes = 0;
		LocalDateTime cursor = departTime;

		for (BookmarkRouteInfo bi : infos) {

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
			leg.setEtaMin(etaMin);

			cursor = cursor.plusMinutes(legMinutes);
			totalMinutes += legMinutes;

			// path_json → leg.path
			setLegPathFromStoredJsonOrFallback(leg, bi);

			// path_json → leg.polyline (좌표만 추출)
			try {
				List<Map<String,Object>> pathMaps = null;
				if (bi.getPathJson()!=null && !bi.getPathJson().isBlank()) {
					pathMaps = objectMapper.readValue(bi.getPathJson(), new TypeReference<List<Map<String,Object>>>(){});
				}
				if (pathMaps == null || pathMaps.isEmpty()) {
					pathMaps = new ArrayList<>();
					addPoint(pathMaps, 1, bi.getDepartureName(), null, bi.getStartLat(), bi.getStartLng());
					addPoint(pathMaps, 2, bi.getDestinationName(), null, bi.getEndLat(), bi.getEndLng());
				}

				List<RouteDetailDTO.PolylinePointDTO> poly = new ArrayList<>();
				for (Map<String,Object> m : pathMaps) {
					Object latO = m.get("lat");
					Object lngO = m.get("lng");
					Double lat = (latO instanceof Number) ? ((Number)latO).doubleValue() : null;
					Double lng = (lngO instanceof Number) ? ((Number)lngO).doubleValue() : null;
					if (lat!=null && lng!=null) {
						poly.add(RouteDetailDTO.PolylinePointDTO.builder().lat(lat).lng(lng).build());
					}
				}

				// 좌표 사이가 너무 멀면 보강
				if (poly.size() < 30) {
					List<double[]> raw = new ArrayList<>();
					for (RouteDetailDTO.PolylinePointDTO p : poly) raw.add(new double[]{p.getLat(), p.getLng()});
					raw = densify(raw, 30.0);
					poly = new ArrayList<>();
					for (double[] p : raw) poly.add(RouteDetailDTO.PolylinePointDTO.builder().lat(p[0]).lng(p[1]).build());
				}
				leg.setPolyline(poly);
			} catch (Exception ignore) {
			}

			if (getLegPathOrNull(leg) == null) {
				log.info("[BKMRK] path is NULL: order={} type={} lineName={}",
					bi.getOrder(), bi.getType(), bi.getLineName());
			}

			leg = enrichLegWithGeocodingIfNeeded(leg);
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

	// 옵션별 경로 선택
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

	/** json 형태의 subPath 생성 */
	private String buildPathJsonFromSubPath(OdSayResponseDTO.SubPath sp, String mapObj) throws Exception {
		if (sp == null) return "[]";

		List<StationLite> anchors = new ArrayList<>();
		if (sp.getPassStopList()!=null && sp.getPassStopList().getStations()!=null) {
			for (OdSayResponseDTO.Station st : sp.getPassStopList().getStations()) {
				if (st==null || st.getY()==null || st.getX()==null) continue;
				StationLite a = new StationLite();
				a.name = st.getStationName();
				a.stationId = (st.getStationID()!=null ? String.valueOf(st.getStationID()) : null);
				a.lat = st.getY();
				a.lng = st.getX();
				anchors.add(a);
			}
		}

		// loadLane → 클립(레그 시작/끝 근접) 시도
		List<double[]> clipped = Collections.emptyList();
		if (mapObj != null && !mapObj.isBlank()) {
			List<double[]> seg = loadLanePolyline(mapObj);               // 전체 라인
			clipped = clipByEndpoints(seg, sp.getStartY(), sp.getStartX(), sp.getEndY(), sp.getEndX()); // 구간만
		}

		// 실패 시 passStopList 기반의 간이 라인
		if (clipped == null || clipped.isEmpty()) {
			List<double[]> approx = new ArrayList<>();
			if (sp.getStartY()!=null && sp.getStartX()!=null) approx.add(new double[]{sp.getStartY(), sp.getStartX()});
			for (StationLite a : anchors) approx.add(new double[]{a.lat, a.lng});
			if (sp.getEndY()!=null && sp.getEndX()!=null) approx.add(new double[]{sp.getEndY(), sp.getEndX()});
			clipped = approx;
		}

		if (clipped.size() < 30) clipped = densify(clipped, 30.0);

		// 4) 정류장/역을 polyline에 매칭해서 name/stationId 주입 (근접 임계값 50m)
		return toPathJsonWithAnchors(clipped, anchors, 50.0);
	}

	/** 리스트 + 정류장/역 앵커 → path_json 직렬화 */
	private String toPathJsonWithAnchors(List<double[]> line, List<StationLite> anchors, double tolMeters) throws Exception {
		if (line == null) line = Collections.emptyList();
		if (anchors == null) anchors = Collections.emptyList();

		// polyline 포인트를 먼저 JSON으로 만든다.
		List<Map<String,Object>> path = new ArrayList<>(line.size());
		for (int i = 0; i < line.size(); i++) {
			double[] p = line.get(i);
			Map<String,Object> m = new LinkedHashMap<>();
			m.put("seq", i+1);
			m.put("lat", p[0]);
			m.put("lng", p[1]);
			path.add(m);
		}

		// 각 anchor를 polyline에서 가장 가까운 인덱스에 맵핑
		for (StationLite a : anchors) {
			int idx = nearestIndex(line, a.lat, a.lng);
			if (idx < 0) continue;
			double d = haversine(a.lat, a.lng, line.get(idx)[0], line.get(idx)[1]);
			if (d > tolMeters) continue; // 너무 멀면 스킵(경로가 다른 경우)
			Map<String,Object> m = path.get(idx);
			// 이미 이름이 있더라도 정류장 정보가 우선
			if (a.name != null && !a.name.isBlank()) m.put("name", a.name);
			if (a.stationId != null && !a.stationId.isBlank()) m.put("stationId", a.stationId);
		}

		path = downSample(path, 800);

		return objectMapper.writeValueAsString(path);
	}

	private static void addPoint(List<Map<String,Object>> list, int seq, String name, String stationId, Double lat, Double lng) {
		if (lat == null || lng == null) return;
		Map<String,Object> m = new LinkedHashMap<>();
		m.put("seq", seq);
		m.put("name", name);
		if (stationId != null) m.put("stationId", stationId);
		m.put("lat", lat);
		m.put("lng", lng);
		list.add(m);
	}

	/** passStopList -> StationLite 변환 */
	private List<StationLite> convertPassStopStations(List<OdSayResponseDTO.Station> raw) {
		List<StationLite> out = new ArrayList<>(raw.size());
		for (OdSayResponseDTO.Station st : raw) {
			if (st == null) continue;
			Double lat = st.getY();
			Double lng = st.getX();
			if (lat == null || lng == null) continue;
			StationLite s = new StationLite();
			s.name = st.getStationName();
			s.stationId = (st.getStationID() != null ? String.valueOf(st.getStationID()) : null);
			s.lat = lat;
			s.lng = lng;
			out.add(s);
		}
		return out;
	}

	/** path_json -> leg.path, leg.polyline 세팅 */
	private void setLegPathFromStoredJsonOrFallback(RouteDetailDTO.Leg leg, BookmarkRouteInfo bi) {
		List<Map<String,Object>> raw = null;

		// 저장된 path_json 읽기
		if (bi.getPathJson() != null && !bi.getPathJson().isBlank()) {
			try {
				raw = objectMapper.readValue(
					bi.getPathJson(),
					new com.fasterxml.jackson.core.type.TypeReference<List<Map<String,Object>>>(){}
				);
			} catch (Exception e) {
				log.info("[BKMRK] read path_json failed: id={} msg={}", bi.getBookmarkId(), e.getMessage());
			}
		}

		// 폴백: 최소 두 점(출발/도착)
		if (raw == null || raw.isEmpty()) {
			raw = new ArrayList<>();
			addPoint(raw, 1, bi.getDepartureName(), null, bi.getStartLat(), bi.getStartLng());
			addPoint(raw, 2, bi.getDestinationName(), null, bi.getEndLat(), bi.getEndLng());
		}

		// polyline = raw 전체
		List<RouteDetailDTO.PolylinePointDTO> poly = new ArrayList<>(raw.size());
		for (Map<String,Object> m : raw) {
			Double lat = toDouble(m.get("lat"));
			Double lng = toDouble(m.get("lng"));
			if (lat == null || lng == null) continue;
			poly.add(RouteDetailDTO.PolylinePointDTO.builder().lat(lat).lng(lng).build());
		}
		// 세팅
		try {
			Method setPolyline = leg.getClass().getMethod("setPolyline", java.util.List.class);
			setPolyline.invoke(leg, poly);
		} catch (NoSuchMethodException nsme) {
			log.info("[BKMRK] Leg has no setPolyline(List) method; skip setting polyline");
		} catch (Exception e) {
			log.info("[BKMRK] setPolyline via reflection failed: {}", e.getMessage());
		}

		// path = 앵커만(name 또는 stationId가 있는 포인트만)
		List<Map<String,Object>> anchorsOnly = new ArrayList<>();
		for (Map<String,Object> m : raw) {
			boolean hasName = hasText(m.get("name"));
			boolean hasId   = hasText(m.get("stationId"));
			if (hasName || hasId) {
				anchorsOnly.add(m);
			}
		}

		// 앵커가 하나도 없으면: 출발/도착이라도 앵커로 구성(이름/ID는 없을 수 있음)
		if (anchorsOnly.isEmpty()) {
			anchorsOnly = new ArrayList<>();
			addPoint(anchorsOnly, 1, bi.getDepartureName(), null, bi.getStartLat(), bi.getStartLng());
			addPoint(anchorsOnly, 2, bi.getDestinationName(), null, bi.getEndLat(), bi.getEndLng());
		}

		// seq 재부여(1부터)
		for (int i = 0; i < anchorsOnly.size(); i++) {
			anchorsOnly.get(i).put("seq", i + 1);
		}

		// 세팅
		try {
			Method setter = leg.getClass().getMethod("setPath", java.util.List.class);
			setter.invoke(leg, anchorsOnly);
		} catch (NoSuchMethodException nsme) {
			log.info("[BKMRK] Leg has no setPath(List) method; skip setting path");
		} catch (Exception e) {
			log.info("[BKMRK] setPath via reflection failed: {}", e.getMessage());
		}
	}

	/** Object -> Double 안전 변환 */
	private static Double toDouble(Object v) {
		if (v == null) return null;
		if (v instanceof Double d) return d;
		if (v instanceof Number n) return n.doubleValue();
		try { return Double.parseDouble(String.valueOf(v)); } catch (Exception ignore) { return null; }
	}

	/** 비어있지 않은 텍스트인지 */
	private static boolean hasText(Object v) {
		if (v == null) return false;
		String s = String.valueOf(v).trim();
		return !s.isEmpty() && !"null".equalsIgnoreCase(s);
	}

	/** DTO에 path가 이미 들어갔는지 확인(리플렉션) */
	private Object getLegPathOrNull(RouteDetailDTO.Leg leg) {
		try {
			Method getter = leg.getClass().getMethod("getPath");
			return getter.invoke(leg);
		} catch (Exception ignore) { return null; }
	}

	/** passStopList가 부족할 때: mapObj로 loadLane 호출하여 전체 정류장/역 리스트 확보 */
	private List<StationLite> fetchStationsFromLoadLane(String mapObj) {
		try {
			if (mapObj == null || mapObj.isBlank()) {
				log.info("[PATH] loadLane skipped: empty mapObj");
				return null;
			}

			String url = org.springframework.web.util.UriComponentsBuilder
				.fromHttpUrl("https://api.odsay.com/v1/api/loadLane")
				.queryParam("apiKey", odsayApiKey)
				.queryParam("mapObject", mapObj)
				.build()
				.toUriString();

			String body = restTemplate.getForObject(url, String.class);
			if (body == null || body.isBlank()) {
				log.info("[PATH] loadLane empty body");
				return null;
			}
			if (body.length() <= 300) {
				log.info("[PATH] loadLane body: {}", body);
			}

			JsonNode root = objectMapper.readTree(body);
			JsonNode error = root.path("error");
			if (!error.isMissingNode()) {
				log.info("[PATH] loadLane error: {}", error.toString());
				return null;
			}

			JsonNode result = root.path("result");
			if (result.isMissingNode()) {
				log.info("[PATH] loadLane no result");
				return null;
			}

			// 다양한 응답 포맷을 커버하기 위해 "좌표/이름이 있는 객체"를 리스트로 만든다.
			List<StationLite> out = new ArrayList<>();
			collectStationsDeep(result, out, 3); // 깊이 3까지 스캔

			if (out.isEmpty()) {
				log.info("[PATH] loadLane found 0 stations");
				return null;
			}

			// 연속 중복 제거
			List<StationLite> dedup = new ArrayList<>();
			StationLite prev = null;
			for (StationLite s : out) {
				if (prev != null && equalsLite(prev, s)) continue;
				dedup.add(s);
				prev = s;
			}

			log.info("[PATH] loadLane stations={}", dedup.size());
			// 너무 많은 경우 간단 샘플링
			if (dedup.size() > 1200) {
				List<StationLite> small = new ArrayList<>();
				double step = (double)(dedup.size() - 1) / 799.0;
				for (int i = 0; i < 800; i++) {
					int idx = (int)Math.round(i * step);
					small.add(dedup.get(idx));
				}
				return small;
			}
			return dedup;

		} catch (Exception e) {
			log.info("[PATH] loadLane exception: {}", e.getMessage());
			return null;
		}
	}

	/** loadLane/기타 JSON에서 좌표/이름이 보이는 객체들을 수집 */
	private void collectStationsDeep(JsonNode node, List<StationLite> out, int depth) {
		if (node == null || depth < 0) return;

		if (node.isArray()) {
			for (int i = 0; i < node.size(); i++) {
				collectStationsDeep(node.get(i), out, depth);
			}
			return;
		}

		if (node.isObject()) {
			StationLite s = toStationLiteOrNull(node);
			if (s != null) {
				out.add(s);
			}
			Iterator<String> it = node.fieldNames();
			while (it.hasNext()) {
				String k = it.next();
				JsonNode v = node.get(k);
				collectStationsDeep(v, out, depth - 1);
			}
		}
	}

	/** 좌표/이름/ID 후보를 최대한 유연하게 뽑아 StationLite로 변환 */
	private StationLite toStationLiteOrNull(JsonNode obj) {
		if (obj == null || !obj.isObject()) return null;

		// 이름 후보
		String name = firstText(obj, "stationName","name","nodeName","stopName","station","fname","tname");
		// 좌표 후보 (ODsay는 x=경도, y=위도)
		Double lng = firstDouble(obj, "x","X","lon","lng");
		Double lat = firstDouble(obj, "y","Y","lat");

		// ID 후보
		String id = firstText(obj, "stationID","stationId","stopID","stopId","arsID","arsId","nodeId","id");

		if (lat == null || lng == null) return null;

		StationLite s = new StationLite();
		s.name = name;
		s.stationId = id;
		s.lat = lat;
		s.lng = lng;
		return s;
	}

	/** 이름/좌표로 가장 잘 맞는 인덱스 찾기 (StationLite 버전) */
	private static int findBestIndexByNameOrCoordLite(List<StationLite> sts, String name, Double lat, Double lng) {
		int byName = findIndexByNameLite(sts, name);
		if (byName != -1) return byName;
		if (lat == null || lng == null) return -1;
		return findNearestIndexByCoordLite(sts, lat.doubleValue(), lng.doubleValue());
	}

	private static int findIndexByNameLite(List<StationLite> sts, String target) {
		if (target == null) return -1;
		String t = normalizeName(target);
		for (int i = 0; i < sts.size(); i++) {
			String n = normalizeName(sts.get(i).name);
			if (t.equals(n)) return i;
		}
		return -1;
	}

	private static int findNearestIndexByCoordLite(List<StationLite> sts, double lat, double lng) {
		double best = Double.MAX_VALUE;
		int bestIdx = -1;
		for (int i = 0; i < sts.size(); i++) {
			StationLite s = sts.get(i);
			if (s.lat == null || s.lng == null) continue;
			double d = (s.lat - lat)*(s.lat - lat) + (s.lng - lng)*(s.lng - lng);
			if (d < best) { best = d; bestIdx = i; }
		}
		return bestIdx;
	}

	private static boolean equalsLite(StationLite a, StationLite b) {
		if (a == b) return true;
		if (a == null || b == null) return false;
		boolean sameName = (normalizeName(a.name).equals(normalizeName(b.name)));
		boolean sameCoord = (a.lat != null && b.lat != null && a.lng != null && b.lng != null
			&& Math.abs(a.lat - b.lat) < 1e-7 && Math.abs(a.lng - b.lng) < 1e-7);
		return sameName && sameCoord;
	}

	/** 숫자 파서 보조 */
	private static Double firstDouble(JsonNode n, String... keys) {
		for (String k : keys) {
			JsonNode v = n.path(k);
			if (v.isNumber()) return v.asDouble();
			if (v.isTextual()) {
				try { return Double.parseDouble(v.asText()); } catch (Exception ignore) {}
			}
		}
		return null;
	}

	private static String firstText(JsonNode n, String... keys) {
		for (String k : keys) {
			JsonNode v = n.path(k);
			if (v.isTextual()) return v.asText();
			if (v.isNumber()) return String.valueOf(v.asLong());
		}
		return null;
	}

	private static String normalizeName(String s) {
		if (s == null) return "";
		return s.replaceAll("\\s+", "")
			.replace("역", "")
			.replace("정류장", "")
			.replaceAll("[(].*?[)]", "") // 괄호 제거
			.toLowerCase();
	}

	private static Double safeDouble(Double v) { return v; }

	private static List<Map<String,Object>> downSample(List<Map<String,Object>> src, int max) {
		if (src == null || src.size() <= max) return src;
		List<Map<String,Object>> out = new ArrayList<>(max);
		double step = (double)(src.size() - 1) / (double)(max - 1);
		for (int i = 0; i < max; i++) {
			int idx = (int)Math.round(i * step);
			out.add(src.get(idx));
		}
		// seq 재부여
		for (int i = 0; i < out.size(); i++) out.get(i).put("seq", i + 1);
		return out;
	}

	/** loadLane(mapObj) → 좌표만 뽑아 (lat,lng) 리스트로 변환 */
	private List<double[]> loadLanePolyline(String mapObj) {
		try {
			// 기존 범용 파서 재사용: StationLite → (lat,lng)
			List<StationLite> sts = fetchStationsFromLoadLane(mapObj);
			if (sts == null || sts.isEmpty()) return Collections.emptyList();
			List<double[]> out = new ArrayList<>(sts.size());
			for (StationLite s : sts) {
				if (s.lat != null && s.lng != null) out.add(new double[]{s.lat, s.lng});
			}
			return out;
		} catch (Exception e) {
			log.info("[BKMRK] loadLanePolyline fail: {}", e.getMessage());
			return Collections.emptyList();
		}
	}

	/** 전체 곡선에서 레그 시작/끝 근접 인덱스로 잘라내기 */
	private List<double[]> clipByEndpoints(List<double[]> segment, Double sLat, Double sLng, Double eLat, Double eLng) {
		if (segment == null || segment.isEmpty()
			|| sLat == null || sLng == null || eLat == null || eLng == null) {
			return Collections.emptyList();
		}
		int sIdx = nearestIndex(segment, sLat, sLng);
		int eIdx = nearestIndex(segment, eLat, eLng);
		if (sIdx == -1 || eIdx == -1) return Collections.emptyList();

		if (sIdx <= eIdx) return new ArrayList<>(segment.subList(sIdx, eIdx + 1));
		List<double[]> rev = new ArrayList<>(segment.subList(eIdx, sIdx + 1));
		Collections.reverse(rev);
		return rev;
	}

	/** 하버사인 거리 기반 가장 가까운 점 인덱스 */
	private int nearestIndex(List<double[]> pts, double lat, double lng) {
		double best = Double.MAX_VALUE;
		int idx = -1;
		for (int i = 0; i < pts.size(); i++) {
			double[] p = pts.get(i);
			double d = haversine(lat, lng, p[0], p[1]);
			if (d < best) { best = d; idx = i; }
		}
		return idx;
	}

	/** 두 점 거리가 maxStepMeters보다 크면 그 사이에 균등 분할 점을 삽입(직선보간) */
	private List<double[]> densify(List<double[]> line, double maxStepMeters) {
		if (line == null || line.size() < 2) return line;
		List<double[]> out = new ArrayList<>();
		out.add(line.get(0));
		for (int i = 0; i < line.size() - 1; i++) {
			double[] a = line.get(i);
			double[] b = line.get(i+1);
			double dist = haversine(a[0], a[1], b[0], b[1]);
			int steps = (int)Math.floor(dist / maxStepMeters);
			for (int s = 1; s <= steps; s++) {
				double t = (double)s / (steps + 1);
				out.add(new double[]{
					a[0] + (b[0] - a[0]) * t,
					a[1] + (b[1] - a[1]) * t
				});
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

	/** (lat,lng) 리스트 → path_json 직렬화 */
	private String toPathJson(List<double[]> line) throws Exception {
		List<Map<String,Object>> path = new ArrayList<>(line.size());
		for (int i = 0; i < line.size(); i++) {
			double[] p = line.get(i);
			Map<String,Object> m = new LinkedHashMap<>();
			m.put("seq", i+1);
			m.put("lat", p[0]);
			m.put("lng", p[1]);
			path.add(m);
		}
		// 너무 길면 샘플링(전송량 방지)
		path = downSample(path, 800);
		return objectMapper.writeValueAsString(path);
	}

	/** 경량 내부 모델 */
	private static class StationLite {
		String name;
		String stationId;
		Double lat;
		Double lng;
	}
}

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

				// 정류장 ID
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

	/** route_info -> bookmark_route_info 복사 */
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

					// Optional -> NPE 방지
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

			setLegPathFromStoredJsonOrFallback(leg, bi);

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

	/** json 형태의 subPath 생성 */
	private String buildPathJsonFromSubPath(OdSayResponseDTO.SubPath sp, String mapObj) throws Exception {
		if (sp == null) return "[]";

		// passStopList 사용
		List<OdSayResponseDTO.Station> pass = (sp.getPassStopList() != null) ? sp.getPassStopList().getStations() : null;

		List<StationLite> src;
		if (pass != null && pass.size() >= 3) {
			src = convertPassStopStations(pass);
		} else {
			// loadLane 호출로 보강
			List<StationLite> fromLoadLane = fetchStationsFromLoadLane(mapObj);
			if (fromLoadLane != null && fromLoadLane.size() >= 3) {
				src = fromLoadLane;
			} else {
				// 없으면 출발/도착점이라도 보강
				List<Map<String,Object>> two = new ArrayList<Map<String,Object>>();
				addPoint(two, 1, sp.getStartName(), null, sp.getStartY(), sp.getStartX());
				addPoint(two, 2, sp.getEndName(), null, sp.getEndY(), sp.getEndX());
				return objectMapper.writeValueAsString(two);
			}
		}

		// start~end 슬라이스
		int startIdx = findBestIndexByNameOrCoordLite(src, sp.getStartName(), sp.getStartY(), sp.getStartX());
		int endIdx   = findBestIndexByNameOrCoordLite(src, sp.getEndName(),   sp.getEndY(), sp.getEndX());

		if (startIdx == -1 || endIdx == -1) {
			startIdx = 0;
			endIdx   = src.size() - 1;
		}

		int from = Math.min(startIdx, endIdx);
		int to   = Math.max(startIdx, endIdx);

		List<Map<String,Object>> path = new ArrayList<Map<String,Object>>();
		int seq = 1;
		for (int i = from; i <= to; i++) {
			StationLite st = src.get(i);
			if (st.lat == null || st.lng == null) continue;
			addPoint(path, seq++, st.name, st.stationId, st.lat, st.lng);
		}

		// 역방향이면 뒤집고 seq 재부여
		if (startIdx > endIdx) {
			Collections.reverse(path);
			for (int i = 0; i < path.size(); i++) path.get(i).put("seq", i + 1);
		}

		// 너무 길면 샘플링
		path = downSample(path, 400);

		return objectMapper.writeValueAsString(path);
	}

	private static void addPoint(List<Map<String,Object>> list, int seq, String name, String stationId, Double lat, Double lng) {
		if (lat == null || lng == null) return;
		Map<String,Object> m = new LinkedHashMap<String,Object>();
		m.put("seq", seq);
		m.put("name", name);
		if (stationId != null) m.put("stationId", stationId);
		m.put("lat", lat);
		m.put("lng", lng);
		list.add(m);
	}

	/** passStopList -> StationLite 변환 */
	private List<StationLite> convertPassStopStations(List<OdSayResponseDTO.Station> raw) {
		List<StationLite> out = new ArrayList<StationLite>(raw.size());
		for (int i = 0; i < raw.size(); i++) {
			OdSayResponseDTO.Station st = raw.get(i);

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

	/** path_json -> leg.path 세팅(리플렉션으로 setPath(List) 호출) */
	private void setLegPathFromStoredJsonOrFallback(RouteDetailDTO.Leg leg, BookmarkRouteInfo bi) {
		List<Map<String,Object>> path = null;

		// 저장된 path_json 있으면 사용
		if (bi.getPathJson() != null && !bi.getPathJson().isBlank()) {
			try {
				path = objectMapper.readValue(bi.getPathJson(), new TypeReference<List<Map<String,Object>>>(){});
			} catch (Exception e) {
				log.info("[BKMRK] read path_json failed: id={} msg={}", bi.getBookmarkId(), e.getMessage());
			}
		}

		// 폴백: 최소 두 점(출발/도착)
		if (path == null || path.isEmpty()) {
			path = new ArrayList<Map<String,Object>>();
			addPoint(path, 1, bi.getDepartureName(), null, bi.getStartLat(), bi.getStartLng());
			addPoint(path, 2, bi.getDestinationName(), null, bi.getEndLat(), bi.getEndLng());
		}

		// leg.setPath(...) (리플렉션 사용: 제네릭 타입 상관없이 List를 주입)
		try {
			Method setter = leg.getClass().getMethod("setPath", java.util.List.class);
			setter.invoke(leg, path);
		} catch (NoSuchMethodException nsme) {
			// DTO에 setPath가 없다면 스킵
			log.info("[BKMRK] Leg has no setPath(List) method; skip setting path");
		} catch (Exception e) {
			log.info("[BKMRK] setPath via reflection failed: {}", e.getMessage());
		}
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

			// 다양한 응답 포맷을 커버하기 위해 "좌표/이름이 있는 객체"를 깊이 있게 모아 리스트로 만든다.
			List<StationLite> out = new ArrayList<StationLite>();
			collectStationsDeep(result, out, 3); // 깊이 3까지 스캔

			if (out.isEmpty()) {
				log.info("[PATH] loadLane found 0 stations");
				return null;
			}

			// 연속 중복 제거
			List<StationLite> dedup = new ArrayList<StationLite>();
			StationLite prev = null;
			for (int i = 0; i < out.size(); i++) {
				StationLite s = out.get(i);
				if (prev != null && equalsLite(prev, s)) continue;
				dedup.add(s);
				prev = s;
			}

			log.info("[PATH] loadLane stations={}", dedup.size());
			// 너무 많은 경우 간단 샘플링(응답 크기 방지)
			if (dedup.size() > 1200) {
				List<StationLite> small = new ArrayList<StationLite>();
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
		for (int i = 0; i < keys.length; i++) {
			String k = keys[i];
			JsonNode v = n.path(k);
			if (v.isNumber()) return v.asDouble();
			if (v.isTextual()) {
				try { return Double.parseDouble(v.asText()); } catch (Exception ignore) {}
			}
		}
		return null;
	}

	private static String firstText(JsonNode n, String... keys) {
		for (int i = 0; i < keys.length; i++) {
			String k = keys[i];
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
		List<Map<String,Object>> out = new ArrayList<Map<String,Object>>(max);
		double step = (double)(src.size() - 1) / (double)(max - 1);
		for (int i = 0; i < max; i++) {
			int idx = (int)Math.round(i * step);
			out.add(src.get(idx));
		}
		// seq 재부여
		for (int i = 0; i < out.size(); i++) out.get(i).put("seq", i + 1);
		return out;
	}

	/** 경량 내부 모델 */
	private static class StationLite {
		String name;
		String stationId;
		Double lat;
		Double lng;
	}
}
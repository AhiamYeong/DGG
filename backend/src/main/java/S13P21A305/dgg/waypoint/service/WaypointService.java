package S13P21A305.dgg.waypoint.service;

import S13P21A305.dgg.waypoint.dto.LatLon;
import S13P21A305.dgg.waypoint.dto.TopCandidateDto;
import S13P21A305.dgg.waypoint.util.ODsayClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import S13P21A305.dgg.waypoint.dto.NearbyPoi;

import java.util.*;

@Service
@RequiredArgsConstructor
public class WaypointService {
    private final NearbyPoiService nearbyPoiService; // 내부에서 getNearby 호출 + 마스터/혼잡도 주입
    private final StopRedisService stopRedisService; // ZSET/Hash 조회용

    final int CANDIDATE_CAP = 300;

    /**
     * 경로(노드 리스트)를 입력으로 받아 Top5 후보 정류장을 산출한다.
     *
     * @param path                 경로 polyline 노드들 (상위 레이어에서 확보)
     * @param perNodeRadiusMeters  각 노드 주변 후보 탐색 반경 (예: 300~500m)
     * @param timeSlot             혼잡도 조회용 시간대(0~23)
     * @param wDistance            거리 가중치 [0..1]
     * @param wCongestion          혼잡도 가중치 [0..1]
     */
    public Mono<List<TopCandidateDto>> pickTop5GivenPath(
            List<LatLon> path, // 확보된 경로의 경유지를 위/경도로 받는다.
            int perNodeRadiusMeters, // 후보지 탐색 반경 (m)
            Integer timeSlot, //시간대
            double wDistance, double wCongestion  //거리, 혼잡도 가중치 ex. (0.4, 0.6)
    ) {
        if (path == null || path.isEmpty()) return Mono.just(List.of());

        final String routeKey = routeKey(path, timeSlot);

        // 1) 경로 노드 샘플링 → 과호출 방지
        List<LatLon> sampled = samplePath(path);

        // 2) 노드별로 getNearby → 후보지 적재(마스터) + 혼잡도(지하철/버스) 주입
        return Flux.fromIterable(sampled)
                .concatMap(node -> nearbyPoiService.find(node.lat(), node.lon(), perNodeRadiusMeters, timeSlot))
                .flatMapIterable(list -> list)
                .distinct(NearbyPoi::stationId) // 3) 중복 제거
                .take(CANDIDATE_CAP)
                .collectList()
                // 4) 경로-후보지 최소거리 Redis 저장
                .flatMap(candidates -> nearbyPoiService.upsertDistanceToPath(candidates, path).thenReturn(candidates))
                // 5) 점수 계산 + ZSET 반영 + Top5 추출
                .flatMap(candidates -> nearbyPoiService.scoreAndPickTop5(candidates, routeKey, wDistance, wCongestion))
                // 6) 상세 DTO로 수화(hydrate)
                .map(topIds -> hydrateTop(routeKey, topIds));
    }

    // ===== 유틸 =====

    // 경로 노드 다운샘플링: N개마다 1개
    private List<LatLon> samplePath(List<LatLon> full) {
        if (full.size() <= 30) return full;        // 짧은 경로는 전체 사용
        List<LatLon> out = new ArrayList<>();
        for (int i = 0; i < full.size(); i += 10) { // 10개마다 1개 샘플
            out.add(full.get(i));
        }
        // 마지막 지점 보장
        if (!out.get(out.size()-1).equals(full.get(full.size()-1))) {
            out.add(full.get(full.size()-1));
        }
        return out;
    }

    // routeKey: ZSET 키  z:route:{roteKey}:candidate 로 사용
    private String routeKey(List<LatLon> path, Integer slot) {
        LatLon s = path.get(0);
        LatLon e = path.get(path.size()-1);
        return String.format(Locale.ROOT, "%.5f,%.5f->%.5f,%.5f@%s",
                s.lat(), s.lon(), e.lat(), e.lon(), (slot == null ? "auto" : slot));
    }

    // ZSET 점수로부터 score 읽어와 TopCandidateDto 구성
    private List<TopCandidateDto> hydrateTop(String routeKey, List<String> stopIds) {
        List<TopCandidateDto> out = new ArrayList<>(stopIds.size());
        String zKey = "z:route:" + routeKey + ":candidates";

        for (String id : stopIds) {
            String key = "stop:" + id;
            Map<Object, Object> m = stopRedisService
                    .getObjectRedisTemplate().opsForHash().entries(key);

            String name = sv(m.get("name"));
            String type = sv(m.get("type"));
            double lat = dv(m.get("lat"));
            double lon = dv(m.get("lon"));
            double distanceM = dv(m.get("distance_m"));
            double congestion = dv(m.get("congestion"));
            Double score = fetchScoreFromZset(zKey, id);

            out.add(new TopCandidateDto(id, type, name, lat, lon, distanceM, congestion, score));
        }
        return out;
    }

    private Double fetchScoreFromZset(String zKey, String stopId) {
        String member = "stop:" + stopId;
        return stopRedisService.getStringRedisTemplate()
                .opsForZSet()
                .score(zKey, member);

//        Set<ZSetOperations.TypedTuple<String>> tuples =
//                stopRedisService.getStringRedisTemplate().opsForZSet()
//                        .rangeByScoreWithScores(zKey, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY);
//        if (tuples == null) return null;
//        for (var t : tuples) {
//            if (("stop:" + stopId).equals(t.getValue())) return t.getScore();
//        }
//        return null;
    }

    private static String sv(Object o) { return o == null ? null : o.toString(); }
    private static double dv(Object o) {
        if (o == null) return Double.NaN;
        if (o instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(o.toString()); } catch (Exception e) { return Double.NaN; }
    }
}

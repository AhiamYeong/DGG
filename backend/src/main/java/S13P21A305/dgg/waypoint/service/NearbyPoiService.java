package S13P21A305.dgg.waypoint.service;

import S13P21A305.dgg.waypoint.dto.LatLon;
import S13P21A305.dgg.waypoint.dto.NearbyPoi;
import S13P21A305.dgg.waypoint.dto.ODsayPointStationResponse;
import S13P21A305.dgg.waypoint.dto.StopDto;
import S13P21A305.dgg.waypoint.util.GeoUtil;
import S13P21A305.dgg.waypoint.util.ODsayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class NearbyPoiService {
    private final ODsayClient odsayClient;
    private final StopRedisService stopRedisService;

    private final NamedParameterJdbcTemplate jdbc;

    /**
     * odsay에서 응답 가져와서 redis에 주입하기
     */
    public Mono<List<NearbyPoi>> find(double lat, double lon, int radiusMeters, Integer timeSlot) {
        return odsayClient.getNearby(lat, lon, radiusMeters)
                .map(this::toNearbyList)
                // 1) odsay -> redis
                // stop:{id} 에 id, name, lat, lon, type 저장
                // geo:stops 에 lat, lon 저장
                .flatMap(list -> saveStopsToRedis(list).thenReturn(list))
                // 2) DB 혼잡도 → Redis stop:{id}.congestion 주입 (반환값 변경 없이 list 그대로 전달)
                .flatMap(list -> upsertCongestionToRedis(list, timeSlot).thenReturn(list));
    }

    /**
     * ODsay 응답을 NearbyPoi 리스트로 변환
     */
    private List<NearbyPoi> toNearbyList(ODsayPointStationResponse response){
        if (response == null || response.result() == null || response.result().lane() == null) return List.of();
        return response.result().lane().stream()
                .filter(l -> l.stationID() != null && l.stationName() != null)
                .map(l -> new NearbyPoi(l.stationClass(), l.stationID(), l.stationName(), l.y(), l.x()))
                .collect(Collectors.toMap(NearbyPoi::stationId, it -> it, (a,b)->a, LinkedHashMap::new))
                .values().stream().toList();
    }


    //redis로 근처 역 적재
    private Mono<Void> saveStopsToRedis(List<NearbyPoi> list) {
        if(list == null || list.isEmpty()) {
            return Mono.empty();
        }

        return Mono.fromRunnable(() -> {
            for(NearbyPoi poi : list) {
                StopDto dto = toStopDto(poi);
                // 개별 redis에 넣기
                // "stop:{id}"
                // "geo:stop"
                stopRedisService.saveOrUpdateStopMaster(dto);
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    private StopDto toStopDto(NearbyPoi p) {
        return new StopDto(
                p.stationId().toString(),
                p.stationName(),
                p.lat(),
                p.lon(),
                mapType(p.type()) // "bus" | "subway"
        );
    }

    //타입 변환
    private String mapType(int stationClass) {
        return switch (stationClass) {
            case 2 -> "subway";
            case 1 -> "bus";
            default -> "unknown";
        };
    }

    /**
     * 지하철, 버스
     * db 속 congestion을 redis로 주입
     * db -> 역명 매칭 -> redis stop:{id}
     */
    private Mono<Void> upsertCongestionToRedis(List<NearbyPoi> list, Integer timeSlot) {
        if (list == null || list.isEmpty()) return Mono.empty();

        // id -> 정규화된 역/정류장 이름
        Map<String, String> subway = list.stream()
                .filter(p -> p.type() == 2) // subway
                .collect(Collectors.toMap(
                        p -> p.stationId().toString(),
                        p -> normalize(p.stationName()),
                        (a,b)->a, LinkedHashMap::new));

        Map<String, String> bus = list.stream()
                .filter(p -> p.type() == 1) // bus
                .collect(Collectors.toMap(
                        p -> p.stationId().toString(),
                        p -> normalize(p.stationName()),
                        (a,b)->a, LinkedHashMap::new));

        if (subway.isEmpty() && bus.isEmpty()) return Mono.empty();

        return Mono.fromRunnable(() -> {
            // 1) 지하철
            if (!subway.isEmpty()) {
                Map<String, Double> subMap = fetchSubwayCongestions(subway.values(), timeSlot);
                subway.forEach((stopId, norm) -> {
                    double cong = subMap.getOrDefault(norm, 0.0);
                    stopRedisService.updateStopCongestion(stopId, cong);
                });
            }
            // 2) 버스
            if (!bus.isEmpty()) {
                String table = "gold_bus_09"; // 예: "gold_bus_09"
                Map<String, Double> busMap = fetchBusCongestions(table, bus.values(), timeSlot);
                bus.forEach((stopId, norm) -> {
                    double cong = busMap.getOrDefault(norm, 0.5);
                    stopRedisService.updateStopCongestion(stopId, cong);
                });
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    /** 운영 월 등에 맞춰 버스 테이블명 결정 (임시로 9월 고정) */
    private String resolveBusTable() {
        return "gold_bus_09";
    }

    /**
     * 지하철
     */
    private Map<String, Double> fetchSubwayCongestions(Collection<String> normNames, Integer timeSlot) {
        if (normNames == null || normNames.isEmpty()) return Map.of();
        String sql = """
            SELECT station, congestion
            FROM gold_subway
            WHERE time_slot = :slot
              AND station IN (:names)
        """;
        Map<String,Object> params = Map.of(
                "slot", timeSlot,
                "names", normNames
        );
        Map<String, Double> out = new HashMap<>();
        jdbc.query(sql, params, rs -> {
            String st = normalize(rs.getString("station"));
            out.put(st, rs.getDouble("congestion"));
        });
        return out;
    }

    /**
     * 버스
     */
    private Map<String, Double> fetchBusCongestions(String table, Collection<String> normNames, Integer timeSlot) {
        if (normNames == null || normNames.isEmpty()) return Map.of();
        String sql = """
                    SELECT departure, AVG(congestion_ratio) AS congestion_ratio
                    FROM gold_bus_09
                    WHERE time_slot = :slot
                      AND departure IN (:names)
                      GROUP BY departure
                    """;
        Map<String, Object> params = Map.of("slot", timeSlot, "names", normNames);

        Map<String, Double> out = new HashMap<>();
        jdbc.query(sql, params, rs -> {
            String st = normalize(rs.getString("departure"));
            out.put(st, rs.getDouble("congestion_ratio"));
        });
        return out;
    }

    /**
     * 정규화
     */
    private String normalize(String raw) {
        if (raw == null) return "";
        String s = raw.trim();
        s = s.replaceAll("\\s+","")
                .replaceAll("\\(.*?\\)","")
//                .replaceAll("역$","")
                .replaceAll("[/_-]","");
        return s;
    }

    /**
     * 경로 노드에서 최소 거리
     */
    public Mono<Void> upsertDistanceToPath(List<NearbyPoi> list, List<LatLon> path) {
        if (list == null || list.isEmpty() || path == null || path.isEmpty()) return Mono.empty();
        return Mono.fromRunnable(() -> {
            for (NearbyPoi poi : list) {
                double dKm = GeoUtil.minDistanceToPath(poi.lat(), poi.lon(), path); // km 단위라고 가정
                double dM = dKm * 1000.0;
                stopRedisService.updateStopDistance(poi.stationId().toString(), dM); // stop:{id}.distance_m
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    public Mono<List<String>> scoreAndPickTop5(List<NearbyPoi> list, String routeKey,
                                               double wDistance, double wCongestion) {
        if (list == null || list.isEmpty()) return Mono.just(List.of());
        return Mono.fromCallable(() -> {
            for (NearbyPoi p : list) {
                String id = p.stationId().toString();
                double distanceM = stopRedisService.getStopDistance(id);     // default 1e9
                double congestion = stopRedisService.getStopCongestion(id);  // default 0~100 스케일 가정

                // 예시 스코어: 낮을수록 좋은 원시값을 “점수는 클수록 좋음”으로 변환
                // distance: 0m → 1.0, 1000m 이상 → 0.0 (clip)
                double distScore = Math.max(0, 1.0 - (distanceM / 1000.0));
                // congestion: 0(널널)→1.0, 100(매우 혼잡)→0.0
                double congScore = Math.max(0, 1.0 - (congestion / 100.0));

                double score = wDistance * distScore + wCongestion * congScore;

                //redis 반영
                stopRedisService.updateStopScore(id, score);
                stopRedisService.zaddCandidate(routeKey, id, score); // ZADD z:route:{routeKey}
            }
            return stopRedisService.topN(routeKey, 5); // ZREVRANGE by score DESC
        }).subscribeOn(Schedulers.boundedElastic());
    }


    //raw json 그대로
    public Mono<Map<String, Object>> findRaw(double lat, double lon, int radiusMeters) {
        return odsayClient.getNearbyRaw(lat, lon, radiusMeters);
    }
}

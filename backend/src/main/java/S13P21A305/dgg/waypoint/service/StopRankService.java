package S13P21A305.dgg.waypoint.service;

import S13P21A305.dgg.waypoint.dto.StopDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StopRankService {

    // Redis: 문자열/Geo/ZSET/TTL 전용 (가벼운 값, 점수, 위치 인덱스용)
    private final StringRedisTemplate stringRedisTemplate;

    // Redis: 해시(JSON 구조 데이터 저장용)
    private final RedisTemplate<String, Object> objectRedisTemplate;

    // 정류장 GEO 인덱스 키 (모든 정류장 위치를 저장)
    private static final String GEO_INDEX_KEY = "geo:stops";

    /**
     * 정류장 마스터 데이터 보장 (Hash + Geo 저장)
     * - "stop:{id}" 형태의 키로 정류장 기본 정보 저장
     * - GEO 인덱스에 위경도 등록 (근처 검색용)
     */
    public void saveOrUpdateStopMaster(StopDto stop) {
        String stopKey = "stop:" + stop.id();

        // Hash: 정류장 기본 속성 저장
        Map<String, Object> stopInfo = Map.of(
                "id", stop.id(),
                "name", stop.name(),
                "lat", stop.lat(),
                "lon", stop.lon(),
                "type", stop.type()
        );
        objectRedisTemplate.opsForHash().putAll(stopKey, stopInfo);

        // Geo: 위치 인덱스 저장 (이미 존재하면 업데이트처럼 동작)
        stringRedisTemplate.opsForGeo().add(
                GEO_INDEX_KEY,
                new RedisGeoCommands.GeoLocation<>(
                        stopKey,
                        new Point(stop.lon(), stop.lat())
                )
        );
    }

    /**
     * 경유지 리스트 redis 저장
     */
    public void saveOrUpdateStopMasters(Collection<StopDto> stops) {
        if(stops == null) return;
        for(StopDto s : stops) {
            saveOrUpdateStopMaster(s);
        }
    }


    /**
     * 특정 경로/컨텍스트 내 정류장 점수 데이터 Upsert
     * - ZSET: 정류장 적합도 점수 저장
     * - Hash: 상세 정보 저장
     * - TTL: 컨텍스트별 데이터 만료 설정
     */
    public void saveOrUpdateContextStop(String contextId, StopScore score, Duration ttl) {
        String rankKey = "ctx:" + contextId + ":rank";               // ZSET: 적합도 랭킹
        String detailKey = "ctx:" + contextId + ":stop:" + score.stopId(); // Hash: 정류장 상세

        // ZSET: 정류장 ID를 member, 적합도 점수를 score로 저장
        stringRedisTemplate.opsForZSet().add(rankKey, "stop:" + score.stopId(), score.suitability());

        // Hash: 상세 데이터 저장
        Map<String, Object> detailInfo = new LinkedHashMap<>();
        detailInfo.put("stopId", score.stopId());
        detailInfo.put("name", score.name());
        detailInfo.put("lat", score.lat());
        detailInfo.put("lon", score.lon());
        detailInfo.put("distance", score.dist());
        detailInfo.put("congestion", score.congestion());
        detailInfo.put("suitability", score.suitability());
        detailInfo.put("timestamp", OffsetDateTime.now().toString());
        objectRedisTemplate.opsForHash().putAll(detailKey, detailInfo);

        // TTL: 랭킹과 상세 데이터 만료 시간 지정
        stringRedisTemplate.expire(rankKey, ttl);
        stringRedisTemplate.expire(detailKey, ttl);
    }

    /**
     * 상위 N개의 정류장 랭킹 조회
     * - ZSET에서 상위 N개 추출
     * - 각 정류장의 상세 데이터 병합 반환
     */
    public List<Map<String, Object>> getTopStops(String contextId, int limit) {
        String rankKey = "ctx:" + contextId + ":rank";

        // ZSET에서 상위 N개 (적합도 높은 순)
        Set<ZSetOperations.TypedTuple<String>> rankedStops =
                stringRedisTemplate.opsForZSet().reverseRangeWithScores(rankKey, 0, limit - 1);

        if (rankedStops == null || rankedStops.isEmpty()) return List.of();

        List<Map<String, Object>> result = new ArrayList<>(rankedStops.size());
        for (var tuple : rankedStops) {
            String stopKey = tuple.getValue();   // e.g. "stop:{id}"
            String stopId = stopKey.substring(5); // "stop:" prefix 제거
            String detailKey = "ctx:" + contextId + ":stop:" + stopId;

            // 상세 데이터 조회
            Map<Object, Object> rawDetail = objectRedisTemplate.opsForHash().entries(detailKey);
            if (rawDetail != null && !rawDetail.isEmpty()) {
                Map<String, Object> detail = new LinkedHashMap<>();
                rawDetail.forEach((k, v) -> detail.put(String.valueOf(k), v));

                // ZSET 점수가 Hash 점수와 다를 경우 ZSET 점수로 덮어씀 (신뢰성 보장)
                if (tuple.getScore() != null) {
                    detail.put("suitability", tuple.getScore());
                }
                result.add(detail);
            }
        }
        return result;
    }

    /**
     * 정류장 점수 DTO
     */
    public record StopScore(
            String stopId,
            String name,
            double lat,
            double lon,
            double dist,
            double congestion,
            double suitability
    ) {}

}

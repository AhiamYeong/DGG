package S13P21A305.dgg.waypoint.service;

import S13P21A305.dgg.waypoint.dto.StopDto;
import lombok.Getter;
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

@Getter
@Service
@RequiredArgsConstructor
public class StopRedisService {

    // Redis: 문자열/Geo/ZSET/TTL 전용 (가벼운 값, 점수, 위치 인덱스용)
    private final StringRedisTemplate stringRedisTemplate;

    // Redis: 해시(JSON 구조 데이터 저장용)
    private final RedisTemplate<String, Object> objectRedisTemplate;

    // 정류장 GEO 인덱스 키 (모든 정류장 위치를 저장)
    private static final String GEO_INDEX_KEY = "geo:stops";

    /**
     * 정류장 점수 DTO
     */
    public record StopScore(String stopId, String name, double lat, double lon, double dist, double congestion, double suitability) {}


    /**
     * 정류장 마스터 데이터 보장 (Hash + Geo 저장)
     * - "stop:{id}" 형태의 키로 정류장 기본 정보 저장
     * - GEO 인덱스에 위경도 등록 (근처 검색용)
     *  stopDto는 후보지를 의미
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
    }

    /**
     * 후보지 리스트를 redis 저장
     */
    public void saveOrUpdateStopMasters(Collection<StopDto> stops) {
        if(stops == null) return;
        for(StopDto s : stops) {
            saveOrUpdateStopMaster(s);
        }
    }

    /**
     * stop:{id}
     * 혼잡도 추가
     */
    public void updateStopCongestion(String stopId, double congestion) {
        String stopKey = "stop:" + stopId;
        objectRedisTemplate.opsForHash().put(stopKey, "congestion", congestion);
    }

    /**
     * 혼잡도 조회
     */
    public double getStopCongestion(String stopId) {
        String key = "stop:" + stopId;
        Object v = objectRedisTemplate.opsForHash().get(key, "congestion");
        if (v == null) return 100.0;           // 미존재 시 불리하게(최대 혼잡) 처리
        if (v instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(v.toString());
        } catch (NumberFormatException e) {
            return 100.0;
        }
    }

    /**
     * 거리 추가
     */
    public void updateStopDistance(String stopId, double meters) {
        String key = "stop:" +stopId;

        objectRedisTemplate.opsForHash().put(key, "distance_m", meters);
    }

    /**
     * 거리 조회
     */
    public double getStopDistance(String stopId) {
        String key = "stop:" + stopId;
        Object v = objectRedisTemplate.opsForHash().get(key, "distance_m");
        if(v == null) return Double.POSITIVE_INFINITY;
        if(v instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(v.toString());
        } catch (NumberFormatException e) {
            return Double.POSITIVE_INFINITY;
        }
    }

    // --- [추가] stop:{id} 해시에 점수 캐시(선택 사항이지만 편의상 제공) ---
    public void updateStopScore(String stopId, double score) {
        String key = "stop:" + stopId;
        objectRedisTemplate.opsForHash().put(key, "score", score);
    }

    // 내부 헬퍼: 라우트 ZSET 키/멤버 일관성
    private static String routeZKey(String routeKey) {
        return "z:route:" + routeKey + ":candidates";
    }
    private static String stopMember(String stopId) {
        return "stop:" + stopId;
    }

    // --- [추가] 라우트별 후보 ZSET에 적합도 반영 ---
    public void zaddCandidate(String routeKey, String stopId, double score) {
        String zKey = routeZKey(routeKey);
        stringRedisTemplate.opsForZSet().add(zKey, stopMember(stopId), score);
    }

    // --- [추가] 라우트별 상위 N개 stopId 조회 ---
    public List<String> topN(String routeKey, int n) {
        String zKey = routeZKey(routeKey);
        Set<ZSetOperations.TypedTuple<String>> tuples =
                stringRedisTemplate.opsForZSet().reverseRangeWithScores(zKey, 0, Math.max(0, n - 1));

        if (tuples == null || tuples.isEmpty()) return List.of();

        List<String> out = new ArrayList<>(tuples.size());
        for (ZSetOperations.TypedTuple<String> t : tuples) {
            String member = t.getValue();              // e.g. "stop:{id}"
            if (member == null) continue;
            if (member.startsWith("stop:")) {
                out.add(member.substring(5));          // "stop:" 프리픽스 제거 → 순수 id
            } else {
                out.add(member);
            }
        }
        return out;
    }
}

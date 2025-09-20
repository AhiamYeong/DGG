package S13P21A305.dgg.route.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class RouteCacheService { // redis cache I/O
	private static final Duration TTL_24H = Duration.ofHours(24);
	private final StringRedisTemplate redis;
	private final ObjectMapper objectMapper;

	public <T> void saveSummary(String routeId, T dto) {
		set(summaryKey(routeId), toJson(dto), TTL_24H);
	}
	public <T> T getSummary(String routeId, Class<T> type) {
		String v = get(summaryKey(routeId));
		return v == null ? null : fromJson(v, type);
	}

	public <T> void saveDetail(String routeId, T dto) {
		set(detailKey(routeId), toJson(dto), TTL_24H);
	}
	public <T> T getDetail(String routeId, Class<T> type) {
		String v = get(detailKey(routeId));
		return v == null ? null : fromJson(v, type);
	}

	/* meta (상세 재생성용: 출/도착/경유/옵션/출발시각) */
	public <T> void saveMeta(String routeId, T dto) {
		set(metaKey(routeId), toJson(dto), TTL_24H);
	}
	public <T> T getMeta(String routeId, Class<T> type) {
		String v = get(metaKey(routeId));
		return v == null ? null : fromJson(v, type);
	}

	/* internal */
	private void set(String key, String val, Duration ttl){ redis.opsForValue().set(key, val, ttl); }
	private String get(String key){ return redis.opsForValue().get(key); }
	private String summaryKey(String id){ return "route:"+id+":summary"; }
	private String detailKey (String id){ return "route:"+id+":detail"; }
	private String metaKey   (String id){ return "route:"+id+":meta"; }

	private <T> String toJson(T obj){
		try { return objectMapper.writeValueAsString(obj); }
		catch (Exception e){ throw new RuntimeException(e); }
	}
	private <T> T fromJson(String s, Class<T> t){
		try { return objectMapper.readValue(s, t); }
		catch (Exception e){ throw new RuntimeException(e); }
	}
}

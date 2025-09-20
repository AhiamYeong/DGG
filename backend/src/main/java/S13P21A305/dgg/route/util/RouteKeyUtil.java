package S13P21A305.dgg.route.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class RouteKeyUtil { // cache key(route key) 생성하는 util, redis에 넣을 id 생성
	private RouteKeyUtil() {}

	public static String makeRouteId(String dep, String dest, String type, String startTime) {
		String raw = dep.trim().toLowerCase() + "|" +
			dest.trim().toLowerCase() + "|" +
			type + "|" + startTime + "|v1";
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));
			StringBuilder sb = new StringBuilder();
			for (int i = 0; i < 12; i++) sb.append(String.format("%02x", hash[i])); // 24자
			return sb.toString();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}

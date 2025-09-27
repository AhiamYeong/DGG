package S13P21A305.dgg.waypoint.dto;

import java.util.List;

import S13P21A305.dgg.route.domain.RoutePayload;

public record WaypointRouteBundle(
	String stopId,
	String name,
	String type,
	double lat, double lon,
	double distanceM, double congestion, Double score,
	List<RoutePayload> legA,  // 출발 -> 경유
	List<RoutePayload> legB   // 경유 -> 도착
) {}

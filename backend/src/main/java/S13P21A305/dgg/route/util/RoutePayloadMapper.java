// src/main/java/S13P21A305/dgg/route/controller/RouteMapper.java
package S13P21A305.dgg.route.util;

import S13P21A305.dgg.route.domain.Route;
import S13P21A305.dgg.route.domain.TransportType;
import S13P21A305.dgg.route.domain.RoutePayload;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class RoutePayloadMapper {
    private RoutePayloadMapper() {}

    public static List<Route> toRoutesFromPayload(List<RoutePayload> data) {
        if (data == null || data.isEmpty()) return List.of();

        var sorted = data.stream()
                .sorted(Comparator.comparingInt(p -> p.order() == null ? 0 : p.order()))
                .toList();

        List<Route> out = new ArrayList<>(Math.max(16, sorted.size() * 3));

        for (var seg : sorted) {
            var type = parseType(seg.type());
            int totalMin = seg.timeTaken() == null ? 0 : seg.timeTaken();

            var path = seg.path();
            // 1) path가 2개 이상 좌표를 가지면, 경유 구간으로 분할
            if (path != null && path.size() >= 2) {
                // 좌표 있는 노드만 사용
                List<RoutePayload.PathNode> nodes = path.stream()
                        .filter(p -> p.lat() != null && p.lng() != null)
                        .toList();

                if (nodes.size() >= 2) {
                    int n = nodes.size();
                    double[] dists = new double[n - 1];
                    double distSum = 0;
                    for (int i = 1; i < n; i++) {
                        dists[i - 1] = haversineM(
                                nodes.get(i - 1).lat(), nodes.get(i - 1).lng(),
                                nodes.get(i).lat(),     nodes.get(i).lng()
                        );
                        distSum += dists[i - 1];
                    }

                    // 거리비례 정수 분배 (남은 분은 마지막 구간에 보정)
                    int remain = totalMin;
                    double remainDist = distSum;
                    for (int i = 0; i < dists.length; i++) {
                        int mins;
                        if (i == dists.length - 1) {
                            mins = Math.max(0, remain);
                        } else if (remainDist > 0) {
                            mins = (int) Math.floor(remain * (dists[i] / remainDist));
                        } else {
                            mins = 0;
                        }
                        remain -= mins;
                        remainDist -= dists[i];

                        String sp = nodes.get(i).name() != null ? nodes.get(i).name() : seg.startPoint();
                        String ep = nodes.get(i + 1).name() != null ? nodes.get(i + 1).name() : seg.endPoint();

                        out.add(Route.builder()
                                .type(type)
                                .distanceM(dists[i])
                                .timeTaken(mins)
                                .congestionRate(type == TransportType.WALKING ? null : 0.0) // provider가 채움
                                .startPoint(sp)
                                .endPoint(ep)
                                .lineName(seg.lineName())
                                .build());
                    }
                    continue; // 다음 segment로
                }
            }

            // 2) path가 없거나 쓸 수 없으면 단일 구간
            double dist = 0.0;
            if (seg.startLat() != null && seg.startLng() != null && seg.endLat() != null && seg.endLng() != null) {
                dist = haversineM(seg.startLat(), seg.startLng(), seg.endLat(), seg.endLng());
            }
            out.add(Route.builder()
                    .type(type)
                    .distanceM(dist)
                    .timeTaken(Math.max(0, totalMin))
                    .congestionRate(type == TransportType.WALKING ? null : 0.0)
                    .startPoint(seg.startPoint())
                    .endPoint(seg.endPoint())
                    .lineName(seg.lineName())
                    .build());
        }
        return out;
    }

    private static TransportType parseType(String t) {
        if (t == null) return TransportType.WALKING;
        try { return TransportType.valueOf(t.toUpperCase()); }
        catch (Exception e) { return TransportType.WALKING; }
    }

    // 하버사인 거리(m)
    private static double haversineM(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon/2)*Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}

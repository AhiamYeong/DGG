package S13P21A305.dgg.waypoint.util;

import S13P21A305.dgg.waypoint.dto.LatLon;

import java.util.List;

public class GeoUtil {
    private GeoUtil() {}
    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0; //지구 반지름
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon/2)*Math.sin(dLon/2);
        return R * 2 * Math.asin(Math.sqrt(a));
    }

    public static double minDistanceToPath(double lat, double lon, List<LatLon> path) {
        return path.stream()
                .mapToDouble(p -> haversineKm(lat, lon, p.lat(), p.lon()))
                .min().orElse(Double.POSITIVE_INFINITY);
    }

}

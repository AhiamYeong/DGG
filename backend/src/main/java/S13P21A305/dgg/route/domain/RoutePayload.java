// src/main/java/.../RoutePayload.java
package S13P21A305.dgg.route.domain;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.List;

public record RoutePayload(
        String type,            // SUBWAY | BUS | WALKING
        String lineName,
        Integer timeTaken, // 둘 다 허용
        String startPoint, String endPoint,
        Double startLat, Double startLng, Double endLat, Double endLng,
        List<PathNode> path,    // [{name, lat, lng}, ...]
        Integer order,
        List<Object> polyline,  // 무시
        Integer etaMin          // 무시
) {
    public record PathNode(String name, Double lat, Double lng) {}
}

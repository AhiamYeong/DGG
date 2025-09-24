package S13P21A305.dgg.waypoint.dto;

/**
 * 근접 역 담는 dto
 */
public record NearbyPoi(
        Integer type,
        Integer stationId,
        String stationName,
        double lat,
        double lon
) {}

package S13P21A305.dgg.waypoint.dto;

public record StopDto (
        String id,
        String name,
        double lat,
        double lon,
        String type
){}
package S13P21A305.dgg.waypoint.dto;

public record TopCandidateDto(
        String stopId,
        String name,
        double lat,
        double lon,
        double distanceM,
        double congestion,
        Double score
) {}

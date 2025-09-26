package S13P21A305.dgg.waypoint.dto;

public record CandidateWithScore(
        Integer type,
        Integer stationID,
        String stationName,
        double lat,
        double lon,
        double distance,
        double congestion,
        double score
) {}

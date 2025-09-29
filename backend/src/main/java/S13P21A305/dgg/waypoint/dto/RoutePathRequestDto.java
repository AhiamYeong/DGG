package S13P21A305.dgg.waypoint.dto;

import lombok.AllArgsConstructor;

import java.util.List;

public record RoutePathRequestDto(
        List<LatLon> path
){}
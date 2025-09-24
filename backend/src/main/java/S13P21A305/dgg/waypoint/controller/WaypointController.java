package S13P21A305.dgg.waypoint.controller;

import S13P21A305.dgg.waypoint.dto.RoutePathRequestDto;
import S13P21A305.dgg.waypoint.dto.TopCandidateDto;
import S13P21A305.dgg.waypoint.service.WaypointService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/waypoints")
public class WaypointController {

    private final WaypointService waypointService;

    @PostMapping("/top5")
    public Mono<List<TopCandidateDto>> top5(
            @RequestBody RoutePathRequestDto req,
            @RequestParam(defaultValue = "350") int radiusMeters,
            @RequestParam(required = false) Integer timeSlot,         // 0~23 (null 허용)
            @RequestParam(defaultValue = "0.6") double wDistance,     // 거리 가중치
            @RequestParam(defaultValue = "0.4") double wCongestion    // 혼잡도 가중치
    ) {
        return waypointService.pickTop5GivenPath(
                req.path(), radiusMeters, timeSlot, wDistance, wCongestion
        );
    }

}

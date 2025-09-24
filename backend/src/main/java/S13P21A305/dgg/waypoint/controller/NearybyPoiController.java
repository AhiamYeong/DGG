package S13P21A305.dgg.waypoint.controller;

import S13P21A305.dgg.waypoint.dto.NearbyPoi;
import S13P21A305.dgg.waypoint.service.NearbyPoiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nearby")
@RequiredArgsConstructor
public class NearybyPoiController {

    private final NearbyPoiService nearbyPoiService;

    /**
     * 테스트용 controller
     */

    @GetMapping
    public Mono<List<NearbyPoi>> nearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "1000") int radius
    ) {
        return nearbyPoiService.find(lat, lon, radius);
    }

    @GetMapping("/raw")
    public Mono<Map<String, Object>> raw(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "250") int radius
    ) {
        return nearbyPoiService.findRaw(lat, lon, radius);
    }


}

package S13P21A305.dgg.health.controller;

import S13P21A305.dgg.health.dto.request.ActivityUpsertRequest;
import S13P21A305.dgg.health.dto.request.SleepUpdateRequest;
import S13P21A305.dgg.health.dto.response.SimpleOkResponse;
import S13P21A305.dgg.health.service.HealthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    private Long currentMemberId(@RequestHeader("X-Member-Id") Long id){ return id; }

    @PostMapping("/sleep")
    public ResponseEntity<SimpleOkResponse> upsertDailyBySleep(
            @Valid @RequestBody SleepUpdateRequest req,
            @RequestHeader("X-Member-Id") Long memberId
    ){
        healthService.upsertDailyBySleep(memberId, req);
        return ResponseEntity.ok(SimpleOkResponse.ok());
    }

    @PostMapping("/activity")
    public ResponseEntity<SimpleOkResponse> appendActivity(
            @Valid @RequestBody ActivityUpsertRequest req,
            @RequestHeader("X-Member-Id") Long memberId
    ){
        healthService.appendActivity(memberId, req);
        return ResponseEntity.ok(SimpleOkResponse.ok());
    }
}

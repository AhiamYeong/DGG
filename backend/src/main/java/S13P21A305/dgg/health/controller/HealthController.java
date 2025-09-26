package S13P21A305.dgg.health.controller;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.health.dto.request.ActivityUpsertRequest;
import S13P21A305.dgg.health.dto.request.SleepUpdateRequest;
import S13P21A305.dgg.health.dto.response.SimpleOkResponse;
import S13P21A305.dgg.health.service.HealthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @PostMapping("/sleep")
    public ResponseEntity<SimpleOkResponse> upsertDailyBySleep(
            @AuthenticationPrincipal(expression = "memberId") Integer memberId,
            @Valid @RequestBody SleepUpdateRequest req
    ) {
        healthService.upsertDailyBySleep(memberId, req);
        return ResponseEntity.ok(SimpleOkResponse.ok());
    }

    @PostMapping("/activity")
    public ResponseEntity<SimpleOkResponse> appendActivity(
            @AuthenticationPrincipal(expression = "memberId") Integer memberId,
            @Valid @RequestBody ActivityUpsertRequest req
    ) {
        healthService.appendActivity(memberId, req);
        return ResponseEntity.ok(SimpleOkResponse.ok());
    }
}

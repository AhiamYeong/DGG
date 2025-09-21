package S13P21A305.dgg.alarm.controller;

import S13P21A305.dgg.alarm.dto.request.AlarmCreateRequest;
import S13P21A305.dgg.alarm.dto.request.AlarmUpdateRequest;
import S13P21A305.dgg.alarm.dto.response.NextAlarmResponse;
import S13P21A305.dgg.alarm.dto.response.AlarmResponse;
import S13P21A305.dgg.alarm.service.AlarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/alarms")
public class AlarmController {

    private final AlarmService service;

    @GetMapping
    public List<AlarmResponse> list(@RequestParam Integer memberId) {
        return service.list(memberId);
    }

    @PostMapping
    public Map<String, Object> create(@Valid @RequestBody AlarmCreateRequest req) {
        return Map.of("id", service.create(req));
    }

    @PutMapping("/{alarmId}")
    public ResponseEntity<Void> update(@PathVariable Long alarmId,
                                       @RequestParam Integer memberId,
                                       @Valid @RequestBody AlarmUpdateRequest req) {
        service.update(alarmId, memberId, req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{alarmId}")
    public ResponseEntity<Void> delete(@PathVariable Long alarmId,
                                       @RequestParam Integer memberId) {
        service.delete(alarmId, memberId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/next")
    public ResponseEntity<NextAlarmResponse> next(@RequestParam Integer memberId) {
        return service.next(memberId).map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    //-----------------------테스트 용-------------------------
    @Autowired(required = false)
    private S13P21A305.dgg.alarm.fcm.FcmService fcmService;

    @PostMapping("/test-push")
    public Map<String, Object> testPush(@RequestParam Integer memberId) {
        if (fcmService == null) {
            return Map.of("error", "FCM service is not available");
        }
        var result = fcmService.sendToMember(memberId, "테스트 알림", "푸시가 도착해야 정상!", Map.of("type","TEST"));
        return Map.of(
                "total", result.total(),
                "success", result.success(),
                "failure", result.failure(),
                "error", result.error()
        );
    }
}

// AlarmController.java
package S13P21A305.dgg.alarm.controller;

import S13P21A305.dgg.alarm.dto.request.*;
import S13P21A305.dgg.alarm.dto.response.AlarmItemResponse;
import S13P21A305.dgg.alarm.dto.response.NextAlarmResponse;
import S13P21A305.dgg.alarm.service.AlarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/alarms")
public class AlarmController {

    private final AlarmService service;

    // 리스트(리마인더 단위)
    @GetMapping
    public List<AlarmItemResponse> list(@RequestParam Integer memberId) {
        return service.list(memberId);
    }

    // 생성(이벤트 1 + 오프셋 N -> 리마인더 N개, 생성 항목 반환)
    @PostMapping
    public List<AlarmItemResponse> create(@Valid @RequestBody AlarmCreateRequest req) {
        return service.create(req);
    }

    // 수정(이벤트 단위)
    @PutMapping("/{eventId}")
    public List<AlarmItemResponse> update(@PathVariable Long eventId,
                                          @Valid @RequestBody AlarmUpdateRequest req) {
        return service.update(eventId, req);
    }

    // on/off(리마인더 단건)
    @PatchMapping("/{alarmId}")
    public ResponseEntity<Void> toggle(@PathVariable Long alarmId,
                                       @Valid @RequestBody AlarmToggleRequest req) {
        service.toggle(alarmId, req);
        return ResponseEntity.noContent().build();
    }

    // 삭제(리마인더 단건) -> 남은 리스트 반환
    @DeleteMapping("/{alarmId}")
    public List<AlarmItemResponse> delete(@PathVariable Long alarmId,
                                          @RequestParam Integer memberId) {
        return service.delete(alarmId, memberId);
    }

    // 가까운 알림(리마인더 1건에 대한 이벤트 정보)
    @GetMapping("/next")
    public ResponseEntity<NextAlarmResponse> next(@RequestParam Integer memberId) {
        return service.next(memberId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // (옵션) 특정 알림 즉시 테스트 푸시
    @PostMapping("/{alarmId}/push")
    public ResponseEntity<?> pushOne(@PathVariable Long alarmId,
                                     @RequestParam Integer memberId) {
        return ResponseEntity.ok(service.pushNow(alarmId, memberId));
    }
}

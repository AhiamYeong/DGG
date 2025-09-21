// AlarmService.java
package S13P21A305.dgg.alarm.service;

import S13P21A305.dgg.alarm.dto.request.*;
import S13P21A305.dgg.alarm.dto.response.AlarmItemResponse;
import S13P21A305.dgg.alarm.dto.response.NextAlarmResponse;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface AlarmService {
    List<AlarmItemResponse> list(Integer memberId);
    List<AlarmItemResponse> create(AlarmCreateRequest req);
    List<AlarmItemResponse> update(Long eventId, AlarmUpdateRequest req);
    void toggle(Long alarmId, AlarmToggleRequest req);
    List<AlarmItemResponse> delete(Long alarmId, Integer memberId);
    Optional<NextAlarmResponse> next(Integer memberId);

    // 즉시 푸시(테스트/수동 발송용)
    Map<String, Object> pushNow(Long alarmId, Integer memberId);
}

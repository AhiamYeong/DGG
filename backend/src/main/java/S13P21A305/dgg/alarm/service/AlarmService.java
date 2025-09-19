package S13P21A305.dgg.alarm.service;

import S13P21A305.dgg.alarm.dto.request.AlarmCreateRequest;
import S13P21A305.dgg.alarm.dto.request.AlarmUpdateRequest;
import S13P21A305.dgg.alarm.dto.response.AlarmResponse;
import S13P21A305.dgg.alarm.dto.response.NextAlarmResponse;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

public interface AlarmService {
    List<AlarmResponse> list(Integer memberId);
    Long create(AlarmCreateRequest req);
    void update(Long id, Integer memberId, AlarmUpdateRequest req);
    void delete(Long id, Integer memberId);
    Optional<NextAlarmResponse> next(Integer memberId);

    @Transactional
    void setActive(Long id, Integer memberId, boolean active);

    @Transactional
    void setOffsets(Long id, Integer memberId, List<Integer> offsets);
}

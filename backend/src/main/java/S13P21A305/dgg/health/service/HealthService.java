// service/HealthService.java
package S13P21A305.dgg.health.service;

import S13P21A305.dgg.health.dto.request.ActivityUpsertRequest;
import S13P21A305.dgg.health.dto.request.SleepUpdateRequest;

public interface HealthService {
    void upsertDailyBySleep(Long memberId, SleepUpdateRequest req);
    void appendActivity(Long memberId, ActivityUpsertRequest req);
}

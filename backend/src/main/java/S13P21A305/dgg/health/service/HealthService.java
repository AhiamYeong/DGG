// service/HealthService.java
package S13P21A305.dgg.health.service;

import S13P21A305.dgg.health.dto.request.ActivityUpsertRequest;
import S13P21A305.dgg.health.dto.request.SleepUpdateRequest;

public interface HealthService {
    void upsertDailyBySleep(Integer memberId, SleepUpdateRequest req);
    void appendActivity(Integer memberId, ActivityUpsertRequest req);
}

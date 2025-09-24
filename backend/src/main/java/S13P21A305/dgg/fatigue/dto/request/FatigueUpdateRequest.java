package S13P21A305.dgg.fatigue.dto.request;

import S13P21A305.dgg.fatigue.domain.FatigueLog;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class FatigueUpdateRequest {
    private FatigueLog.Reason reason;   // COFFEE, WALK, NAP, TRAFFIC
    private int fatigue_change;         // 감소:-N, 증가:+N
}

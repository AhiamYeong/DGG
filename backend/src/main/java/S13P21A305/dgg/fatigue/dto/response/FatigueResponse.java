package S13P21A305.dgg.fatigue.dto.response;

import S13P21A305.dgg.fatigue.domain.FatigueLog;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class FatigueResponse {
    private LocalDateTime created_at;
    private FatigueLog.Reason reason;
    private int fatigue;          // 변경 후
    private int fatigue_change;   // 증감
}

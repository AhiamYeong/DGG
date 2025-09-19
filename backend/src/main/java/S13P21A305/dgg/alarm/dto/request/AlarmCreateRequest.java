package S13P21A305.dgg.alarm.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/** 알림(이벤트 + 오프셋들) 생성 */
public record AlarmCreateRequest(
        @NotNull Integer memberId,
        String title,
        @NotNull String targetType,  // PLAN | ROUTE | SLEEP | CUSTOM
        Integer targetId,
        @NotNull LocalDateTime departureAt,
        String departureName,
        String destinationName,
        @NotNull List<Integer> offsets // 예: [10,30,60]
) {}
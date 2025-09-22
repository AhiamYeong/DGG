// dto/request/SleepUpdateRequest.java
package S13P21A305.dgg.health.dto.request;

import jakarta.validation.constraints.*;
import java.time.ZonedDateTime;

public record SleepUpdateRequest(
        @NotNull ZonedDateTime sleepDate,     // "2025-09-21T00:00:00+09:00[Asia/Seoul]"
        @Min(0) @Max(100) int sleepScore,     // 수면 점수
        @PositiveOrZero int sleepGoalMin,     // 목표 수면(분)
        @PositiveOrZero int sleepDurationMin, // 실제 수면(분)
        Long sleepStartMs,                    // nullable
        Long sleepEndMs,                      // nullable
        @PositiveOrZero double activeCalories, // 선택(없으면 0)
        @PositiveOrZero int activitySec       // 선택(없으면 0)
) {}

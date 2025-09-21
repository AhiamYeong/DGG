// dto/request/SleepUpdateRequest.java
package S13P21A305.dgg.health.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record SleepUpdateRequest(
        @NotNull LocalDate sleepDate,   // "2025-09-18"
        @Min(0) @Max(100) int sleepScore,
        @PositiveOrZero int sleepGoalMin,     // 목표 수면(분)
        Long sleepStartMs,                    // nullable
        Long sleepEndMs,                      // nullable
        @PositiveOrZero double activeCalories, // 선택(없으면 0)
        @PositiveOrZero int activitySec       // 선택(없으면 0)
) {}

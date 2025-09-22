// dto/request/ActivityUpsertRequest.java
package S13P21A305.dgg.health.dto.request;

import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;

public record ActivityUpsertRequest(
        @NotNull OffsetDateTime windowEnd,
        @PositiveOrZero long totalStep,
        @PositiveOrZero int totalActiveTimeSec,
        @PositiveOrZero double totalActiveCaloriesBurned,
        @PositiveOrZero double totalCaloriesBurned,
        @PositiveOrZero double totalDistanceM
) {}

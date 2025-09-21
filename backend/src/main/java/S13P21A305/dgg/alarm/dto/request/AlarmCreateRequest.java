package S13P21A305.dgg.alarm.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record AlarmCreateRequest(
        @NotNull Integer memberId,
        @NotNull String eventTitle,
        @NotNull LocalDateTime departureTime,
        @NotNull String departure,
        @NotNull String destination,
        @NotNull List<Integer> offsetMinutesList, // [10], [10,30,60]
        @NotNull Boolean enabled
) {}

package S13P21A305.dgg.alarm.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record AlarmUpdateRequest(
        @NotNull Integer memberId,
        String eventTitle,
        LocalDateTime departureTime,
        String departure,
        String destination,
        List<Integer> offsetMinutesList // 주어지면 upsert/disable
) {}

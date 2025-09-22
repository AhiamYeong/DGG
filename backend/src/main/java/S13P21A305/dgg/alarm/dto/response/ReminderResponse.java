package S13P21A305.dgg.alarm.dto.response;

import java.time.LocalDateTime;

public record ReminderResponse(
        Long id,
        Integer offsetMin,
        Boolean enabled,
        LocalDateTime scheduledAt
) {}
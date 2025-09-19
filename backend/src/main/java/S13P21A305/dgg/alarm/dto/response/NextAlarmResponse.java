package S13P21A305.dgg.alarm.dto.response;

import java.time.LocalDateTime;

public record NextAlarmResponse(
        Long alarmEventId,
        Long reminderId,
        Integer offsetMin,
        LocalDateTime scheduledAt,
        String title,
        String departureName,
        String destinationName
) {}

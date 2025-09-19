package S13P21A305.dgg.alarm.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record AlarmResponse(
        Long id,
        Integer memberId,
        String title,
        String targetType,
        Integer targetId,
        LocalDateTime departureAt,
        String departureName,
        String destinationName,
        List<Integer> enabledOffsets
) {}
package S13P21A305.dgg.alarm.dto.request;

import java.time.LocalDateTime;
import java.util.List;

/** 알림(이벤트 + 오프셋들) 수정 */
public record AlarmUpdateRequest(
        String title,
        LocalDateTime departureAt,
        String departureName,
        String destinationName,
        List<Integer> offsets // null이면 변화 없음, 빈 리스트면 모두 비활성
) {}

package S13P21A305.dgg.alarm.dto.response;

public record NextAlarmResponse(
        String eventTitle,
        String departureTime,
        String departure,
        String destination,
        Integer offsetMinutes
) {}

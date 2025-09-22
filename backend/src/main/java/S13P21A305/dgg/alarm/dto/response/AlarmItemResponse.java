// AlarmItemResponse.java
package S13P21A305.dgg.alarm.dto.response;

public record AlarmItemResponse(
        Long alarmId,          // reminder.id
        Long eventId,          // alarm_event.id
        String title,          // "10분 전 알림"
        String eventTitle,
        String departureTime,  // "yyyy-MM-dd HH:mm:ss"
        String departure,
        String destination,
        Integer offsetMinutes,
        boolean enabled
) {}

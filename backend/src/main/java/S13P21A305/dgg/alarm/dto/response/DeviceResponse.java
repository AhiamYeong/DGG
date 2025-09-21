package S13P21A305.dgg.alarm.dto.response;

public record DeviceResponse(
        Long id,
        Integer memberId,
        String pushToken,
        Boolean enabled
) {}
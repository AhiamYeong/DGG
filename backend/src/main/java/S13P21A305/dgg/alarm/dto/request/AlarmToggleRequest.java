package S13P21A305.dgg.alarm.dto.request;

import jakarta.validation.constraints.NotNull;

public record AlarmToggleRequest(
        @NotNull Integer memberId,
        @NotNull Boolean enabled
) {}

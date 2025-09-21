package S13P21A305.dgg.alarm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DeviceRegisterRequest(
        @NotNull Integer memberId,
        @NotBlank String pushToken
) {}

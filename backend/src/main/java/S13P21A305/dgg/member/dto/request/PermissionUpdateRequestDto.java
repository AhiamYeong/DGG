package S13P21A305.dgg.member.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PermissionUpdateRequestDto {
    private boolean generalEnabled;
    private boolean sleepEnabled;
}

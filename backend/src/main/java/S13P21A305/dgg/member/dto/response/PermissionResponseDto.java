package S13P21A305.dgg.member.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PermissionResponseDto {
    private boolean generalEnabled;
    private boolean sleepEnabled;
}

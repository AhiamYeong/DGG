package S13P21A305.dgg.member.dto.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ProfileResponseDto {
    String nickname;
    String email;
}

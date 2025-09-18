package S13P21A305.dgg.member.controller;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.auth.service.AuthService;
import S13P21A305.dgg.member.dto.response.ProfileResponseDto;
import S13P21A305.dgg.member.service.MemberService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/mypage")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponseDto> getProfile(@AuthenticationPrincipal CustomOAuth2User oAuth2User){
        Long memberId = oAuth2User.getMemberId();
        return ResponseEntity.ok(memberService.getProfile(memberId));
    }

    @GetMapping("/debug/me")
    public Map<String,Object> me(Authentication auth, @AuthenticationPrincipal CustomOAuth2User user) {

        return Map.of(
                "isAuth", auth != null && auth.isAuthenticated(),
                "principal", auth == null ? null : auth.getName(),
                "authorities", auth == null ? null : auth.getAuthorities(),
                "userId", user.getMemberId()
        );
    }


}

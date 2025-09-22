package S13P21A305.dgg.member.controller;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.auth.service.AuthService;
import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.dto.request.PermissionUpdateRequestDto;
import S13P21A305.dgg.member.dto.request.ProfileUpdateRequestDto;
import S13P21A305.dgg.member.dto.request.SubmitSurveyRequestDto;
import S13P21A305.dgg.member.dto.request.UpdateSurveyRequestDto;
import S13P21A305.dgg.member.dto.response.*;
import S13P21A305.dgg.member.service.MemberService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mypage")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /**
     * 사용자 정보(마이페이지) 조회
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponseDto> getProfile(@AuthenticationPrincipal CustomOAuth2User oAuth2User){
        Integer memberId = oAuth2User.getMemberId();
        return ResponseEntity.ok(memberService.getProfile(memberId));
    }

    /**
     * 닉네임 정보 변경
     */
    @PatchMapping("/profile")
    public ResponseEntity<ProfileUpdateResponseDto> updateProfile(
            @AuthenticationPrincipal CustomOAuth2User oAuth2User,
            @RequestBody ProfileUpdateRequestDto request){
        Integer memberId = oAuth2User.getMemberId();

        return ResponseEntity.ok(memberService.updateProfile(memberId, request));
    }

    /**
     * 설문조사 제출
     */
    @PostMapping("/survey")
    public ResponseEntity<SubmitSurveyResponseDto> submitSurvey(@AuthenticationPrincipal CustomOAuth2User user,
                                                                @RequestBody List<SubmitSurveyRequestDto> request){
        SubmitSurveyResponseDto response = memberService.submitSurvey(user.getMemberId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).build();

    }

    /**
     * 설문조사 응답 조회
     */
    @GetMapping("/survey")
    public ResponseEntity<List<SurveyResponseDto>> getSurvey(@AuthenticationPrincipal CustomOAuth2User user){
        List<SurveyResponseDto> response = memberService.getSurvey(user.getMemberId());
        return ResponseEntity.ok(response);
    }

    /**
     * 설문조사 수정
     */
    @PutMapping("/survey")
    public ResponseEntity<List<SurveyResponseDto>> updateSurvey(
            @AuthenticationPrincipal CustomOAuth2User user,
            @RequestBody List<UpdateSurveyRequestDto> request) {
        Integer memberId = user.getMemberId();
        List<SurveyResponseDto> response = memberService.updateSurvey(memberId, request);
        return ResponseEntity.ok(response);
    }


    /**
     * 디버깅 컨트롤러
     */
    @GetMapping("/debug/me")
    public Map<String,Object> me(Authentication auth, @AuthenticationPrincipal CustomOAuth2User user) {

        return Map.of(
                "isAuth", auth != null && auth.isAuthenticated(),
                "principal", auth == null ? null : auth.getName(),
                "authorities", auth == null ? null : auth.getAuthorities(),
                "userId", user.getMemberId()
        );
    }

    /**
     * member 알림 허용 여부 조회
     */
    @GetMapping("/alarm/settings")
    public ResponseEntity<PermissionResponseDto> getPermissions(@AuthenticationPrincipal CustomOAuth2User user) {
        Integer memberId = user.getMemberId();
        return ResponseEntity.ok(memberService.getPermissions(memberId));
    }

    /**
     * member 알림 허용 수정
     */
    @PatchMapping("/alarm/settings")
    public ResponseEntity<PermissionResponseDto> updatePermissions(@AuthenticationPrincipal CustomOAuth2User user,
                                                                   @RequestBody PermissionUpdateRequestDto request) {
        Integer memberId = user.getMemberId();
        return ResponseEntity.ok(memberService.updatePermissions(memberId, request));
    }

    /**
     * 회원 탈퇴
     */
    @PatchMapping("/me")
    public ResponseEntity<Void> withdraw(@AuthenticationPrincipal CustomOAuth2User user){
        Integer memberId = user.getMemberId();
        memberService.withdraw(memberId);
        return ResponseEntity.noContent().build();
    }
}

package S13P21A305.dgg.auth.service;

import S13P21A305.dgg.auth.jwt.JWTUtil;
import S13P21A305.dgg.auth.entity.MemberEntity;
import S13P21A305.dgg.member.repository.MemberRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final GoogleTokenVerifierService googleVerifier;
    private final MemberRepository memberRepository;
    private final JWTUtil jwtUtil;

    public ResponseEntity<?> loginWithGoogle(String idTokenStr, HttpServletResponse response) {
        // 1) 구글 ID 토큰 검증
        GoogleIdToken.Payload payload = googleVerifier.verify(idTokenStr);
        if (payload == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "INVALID_ID_TOKEN"));
        }

        // 2) 구글 프로필에서 필요한 값 추출
        String sub = payload.getSubject();               // 구글 고유 ID
        String email = (String) payload.get("email");    // 이메일 (null일 수도 있음)
        String name = (String) payload.getOrDefault("name", "");

        //서비스 회원키 규칙
        String memberKey = "google" + sub;

        // DB 조회/신규 저장
        MemberEntity member = memberRepository.findByMembername(sub);
        if (member == null) {
            member = MemberEntity.builder()
                    .membername(memberKey)     // ✅ 우리 서비스 식별자(고정 규칙)
                    .name(name)                // 닉네임/표시명
                    .email(email)
                    .role("ROLE_MEMBER")       // 가입=로그인 허용이면 MEMBER로 통일
                    .build();
        } else {
            member.setEmail(email);
            member.setName(name);
            memberRepository.save(member);
        }

        String principle = memberKey;
        String role = member.getRole();

        // 3) 서버 자체 JWT 발급 (만료시간은 ms 단위)
        long expiresMs = 60L * 60L * 24 * 1000L; // 24시간
        String jwt = jwtUtil.createJwt(principle, role, expiresMs);

        // 4) 쿠키 발급 (JWTFilter가 Authorization 쿠키만 읽으므로 이름을 그대로 맞춘다)
        response.addCookie(createAuthCookie("Authorization", jwt, (int) (expiresMs / 1000)));

        // 5) JSON 응답
        return ResponseEntity.ok(Map.of(
                "accessToken", jwt,
                "tokenType", "Bearer",
                "expiresIn", expiresMs / 1000,
                "sub", sub,
                "email", email,
                "name", name
        ));}

        private Cookie createAuthCookie(String name, String value, int maxAgeSeconds) {
            Cookie cookie = new Cookie(name, value);
            cookie.setPath("/");
            cookie.setHttpOnly(true); // 앱 코드에서 읽을 필요가 있으면 false로, 보안은 낮아짐
            // cookie.setSecure(true); // HTTPS 배포 시 활성화 권장
            cookie.setMaxAge(maxAgeSeconds); // 초 단위
            return cookie;
        }
}

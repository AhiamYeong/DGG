package S13P21A305.dgg.auth.service;

import S13P21A305.dgg.auth.jwt.JWTUtil;
import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.domain.enums.MemberRole;
import S13P21A305.dgg.member.repository.MemberRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionSystemException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
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
        String googleKey = "google" + sub;

        // DB 조회/신규 저장
        Member member = memberRepository.findByGoogleKey(googleKey);
        if (member == null) {
            member = Member.builder()
                    .googleKey(googleKey)           // 우리 서비스 식별자
                    .nickname(name)                 // 닉네임/표시명
                    .email(email)
                    .role(MemberRole.GUEST)         // 첫 가입자면 GUEST
                    .build();

//            memberRepository.save(member);

            try {
                memberRepository.save(member);
            } catch (DataIntegrityViolationException e) {
                // DB 제약조건 위반 (UNIQUE, NOT NULL 등)
                log.error("DB 제약조건 위반: {}", e.getMessage());
                throw new RuntimeException("이미 존재하는 회원입니다.");
            } catch (TransactionSystemException e) {
                // JPA validation 오류나 트랜잭션 커밋 실패
                log.error("트랜잭션 실패: {}", e.getMessage());
                throw new RuntimeException("저장 중 문제가 발생했습니다.");
            } catch (Exception e) {
                // 그 외 모든 예외
                log.error("예상치 못한 오류: {}", e.getMessage(), e);
                throw new RuntimeException("알 수 없는 오류가 발생했습니다.");
            }

        } else {
            member.setEmail(email);
//            member.setNickname(name);
//            memberRepository.save(member);
            try {
                memberRepository.save(member);
            } catch (DataIntegrityViolationException e) {
                // DB 제약조건 위반 (UNIQUE, NOT NULL 등)
                log.error("DB 제약조건 위반: {}", e.getMessage());
                throw new RuntimeException("이미 존재하는 회원입니다.");
            } catch (TransactionSystemException e) {
                // JPA validation 오류나 트랜잭션 커밋 실패
                log.error("트랜잭션 실패: {}", e.getMessage());
                throw new RuntimeException("저장 중 문제가 발생했습니다.");
            } catch (Exception e) {
                // 그 외 모든 예외
                log.error("예상치 못한 오류: {}", e.getMessage(), e);
                throw new RuntimeException("알 수 없는 오류가 발생했습니다.");
            }
        }

        Integer memberId = member.getId();
        String role = member.getRole().toString();

        // 3) 서버 자체 JWT 발급 (만료시간은 ms 단위)
        long expiresMs = 60L * 60L * 24 * 14 * 1000L; // 2주 - 개발환경
        String jwt = jwtUtil.createJwt(memberId, role, expiresMs);

        // 4) 쿠키 발급 (JWTFilter가 ACCESS_TOKEN 쿠키만 읽으므로 이름을 그대로 맞춘다)
        response.addCookie(createAuthCookie("ACCESS_TOKEN", jwt, (int) (expiresMs / 1000)));

        // 5) JSON 응답
        return ResponseEntity.ok(Map.of(
                "accessToken", jwt,
                "tokenType", "Bearer",
                "expiresIn", expiresMs / 1000,
                "sub", sub,
                "email", email,
                "nickname", name
        ));}

        private Cookie createAuthCookie(String name, String value, int maxAgeSeconds) {
            Cookie cookie = new Cookie(name, value);
            cookie.setPath("/");
            cookie.setHttpOnly(true); // 앱 코드에서 읽을 필요가 있으면 false로, 보안은 낮아짐
            cookie.setSecure(true); // HTTPS 배포 시 활성화 권장
            cookie.setMaxAge(maxAgeSeconds); // 초 단위
            return cookie;
        }
}

package S13P21A305.dgg.auth.controller;

import S13P21A305.dgg.auth.jwt.JWTUtil;
import S13P21A305.dgg.auth.service.GoogleTokenVerifierService;
import S13P21A305.dgg.user.service.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GoogleTokenVerifierService googleVerifier;
    private final JWTUtil jwtUtil;

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> body) {
        String idTokenStr = body.get("idToken");
        if (idTokenStr == null || idTokenStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "ID_TOKEN_REQUIRED"));
        }

        // 1) 구글 ID 토큰 검증
        GoogleIdToken.Payload payload = googleVerifier.verify(idTokenStr);
        if (payload == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "INVALID_ID_TOKEN"));
        }

        // 2) 구글 프로필에서 필요한 값 추출
        String sub = payload.getSubject();               // 구글 고유 ID
        String email = (String) payload.get("email");    // 이메일 (null일 수도 있음)
        String role = "ROLE_MEMBER";                     // 기본 권한

        // 3) 서버 자체 JWT 발급 (만료시간은 ms 단위)
        long expiresMs = 60L * 60L * 1000L; // 1시간
        String serverJwt = jwtUtil.createJwt(sub, role, expiresMs);

        // 4) JSON 응답
        return ResponseEntity.ok(Map.of(
                "accessToken", serverJwt,
                "tokenType", "Bearer",
                "expiresIn", expiresMs / 1000,
                "sub", sub,
                "email", email
        ));
    }
}

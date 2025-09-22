package S13P21A305.dgg.auth.controller;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> body,
                                             HttpServletResponse response) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error","ID_TOKEN_REQUIRED"));
        }

        return authService.loginWithGoogle(idToken.trim().startsWith("Bearer ")
                ? idToken.trim().substring(7) : idToken.trim(), response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal CustomOAuth2User user,
                                       HttpServletResponse response) {
        ResponseCookie accessExpired = ResponseCookie.from("ACCESS_TOKEN", "")
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessExpired.toString());

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }



}

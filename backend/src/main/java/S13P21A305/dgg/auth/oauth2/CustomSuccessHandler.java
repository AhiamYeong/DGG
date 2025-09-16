package S13P21A305.dgg.auth.oauth2;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.auth.jwt.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

@Component
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JWTUtil jwtUtil;

    public CustomSuccessHandler(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        //OAuth2User
        CustomOAuth2User customUserDetails = (CustomOAuth2User) authentication.getPrincipal();

        String username = customUserDetails.getUsername();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        //jwt 생성
        ///60*60*60 60시간짜리 토큰
        String token = jwtUtil.createJwt(username, role, 60*60*1000L);

        //Authorization 쿠키를 심어줌
        response.addCookie(createCookie("Authorization", token));
        //쿠키에 jwt 탐겨서 프엔으로 전달
        response.sendRedirect("http://localhost:3000/");
    }

    private Cookie createCookie(String key, String value) {

        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(60*60*60); //쿠키 유효 시간 (초)
        //cookie.setSecure(true); //https 환경에서만
        cookie.setPath("/"); //전체 경로에서 접근 가능
        cookie.setHttpOnly(true); //js에서 접근 불가능 (보안 강화)

        return cookie;
    }
}

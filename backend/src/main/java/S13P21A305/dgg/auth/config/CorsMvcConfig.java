package S13P21A305.dgg.auth.config;

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class CorsMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry corsRegistry) {

        corsRegistry.addMapping("/**")
                .exposedHeaders("Set-Cookie")
//                .allowCredentials(true) // 쿠키 전송 허용
                .allowedOrigins("http://localhost:3000");
    }
}

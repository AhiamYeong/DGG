package S13P21A305.dgg.member.controller;

import S13P21A305.dgg.auth.service.AuthService;
import S13P21A305.dgg.member.dto.response.ProfileResponseDto;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/mypage")
@RequiredArgsConstructor
public class MemberController {

//    @GetMapping("/profile")
//    public ResponseEntity<ProfileResponseDto> getProfile()
}

package S13P21A305.dgg.fatigue.controller;

import S13P21A305.dgg.fatigue.dto.response.FatigueResponse;
import S13P21A305.dgg.fatigue.dto.request.FatigueUpdateRequest;
import S13P21A305.dgg.fatigue.service.FatigueService;
import S13P21A305.dgg.member.repository.MemberRepository;
import S13P21A305.dgg.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/fatigues")
@RequiredArgsConstructor
public class FatigueController {

    private final FatigueService service;
    private final MemberRepository memberRepository;

    // GET /api/v1/fatigues
    @GetMapping
    public Map<String, Object> current(@AuthenticationPrincipal(expression = "memberId") Integer memberId) {
        int cur = service.currentFatigue(memberId);
        String nickname = memberRepository.findByIdAndIsWithdrawFalse(memberId)
                .map(Member::getNickname)
                .filter(n -> n != null && !n.isBlank())
                .orElse("뚜벅초님");

        return Map.of(
                "nickname", nickname,
                "current_fatigue", cur
        );
    }

    // PUT /api/v1/fatigues
    @PutMapping
    public FatigueResponse update(@AuthenticationPrincipal(expression = "memberId") Integer memberId,
                                  @RequestBody FatigueUpdateRequest req) {
        return service.update(memberId, req);
    }

    // GET /api/v1/fatigues/daily
    @GetMapping("/daily")
    public List<Map<String, Object>> daily(
            @AuthenticationPrincipal(expression = "memberId") Integer memberId) {

        return service.todayHistory(memberId).stream()
                .map(l -> {
                    Map<String, Object> m = new LinkedHashMap<>(); // <-- var 말고 Map으로!
                    m.put("fatigueId", l.getId());
                    m.put("created_at", l.getCreatedAt());
                    m.put("reason", l.getReason() != null ? l.getReason().name() : null);
                    m.put("fatigue", l.getFatigue());
                    m.put("fatigue_change", l.getFatigueChange());
                    return m;
                })
                .collect(Collectors.toList()); // 또는 .toList()
    }
}


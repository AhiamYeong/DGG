package S13P21A305.dgg.fatigue.controller;

import S13P21A305.dgg.fatigue.service.StatsService;
import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/info")
@RequiredArgsConstructor
public class InfoController {

    private final StatsService stats;
    private final MemberRepository memberRepository;

    // GET /api/v1/info/fatigues
    @GetMapping("/fatigues")
    public Map<String, Object> weeklyFatigues(
            @AuthenticationPrincipal(expression = "memberId") Integer memberId,
            @RequestParam(required = false) String weekStart // yyyy-MM-dd (월요일)
    ) {
        LocalDate monday = (weekStart != null)
                ? LocalDate.parse(weekStart)
                : LocalDate.now().with(DayOfWeek.MONDAY);

        var data = stats.weeklyFatigue(memberId, monday).stream()
                .map(it -> Map.of("day", it.day(), "fatigue", it.value()))
                .toList();

        String nickname = memberRepository.findByIdAndIsWithdrawFalse(memberId)
                .map(Member::getNickname)
                .filter(n -> n != null && !n.isBlank())
                .orElse("뚜벅초님");

        return Map.of("nickname", nickname, "fatigue_rank", 7, "data", data);
    }

    // GET /api/v1/info/foot-steps
    @GetMapping("/foot-steps")
    public Map<String, Object> weeklySteps(
            @AuthenticationPrincipal(expression = "memberId") Integer memberId,
            @RequestParam(required = false) String weekStart
    ) {
        LocalDate monday = (weekStart != null)
                ? LocalDate.parse(weekStart)
                : LocalDate.now().with(DayOfWeek.MONDAY);

        var data = stats.weeklyFootSteps(memberId, monday).stream()
                .map(it -> Map.of("day", it.day(), "foot_step", it.value()))
                .toList();
        String nickname = memberRepository.findByIdAndIsWithdrawFalse(memberId)
                .map(Member::getNickname)
                .filter(n -> n != null && !n.isBlank())
                .orElse("뚜벅초님");

        return Map.of("nickname", nickname, "data", data);
    }
}

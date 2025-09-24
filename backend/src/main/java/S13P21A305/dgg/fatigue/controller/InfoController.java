package S13P21A305.dgg.fatigue.controller;

import S13P21A305.dgg.fatigue.service.StatsService;
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

        return Map.of("nickname", "닉네임", "fatigue_rank", 7, "data", data);
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

        return Map.of("nickname", "닉네임", "data", data);
    }
}

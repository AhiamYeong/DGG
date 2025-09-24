package S13P21A305.dgg.fatigue.service;

import S13P21A305.dgg.fatigue.service.FatigueService;
import S13P21A305.dgg.health.repository.HealthInfoLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;
import java.util.stream.IntStream;

@Service @RequiredArgsConstructor
public class StatsService {

    private final FatigueService fatigueService;
    private final HealthInfoLogRepository healthRepo;

    private static LocalDateTime s(LocalDate d){ return d.atStartOfDay(); }
    private static LocalDateTime e(LocalDate d){ return d.plusDays(1).atStartOfDay(); }

    public List<FatigueService.Record> weeklyFatigue(Integer memberId, LocalDate monday){
        return fatigueService.weeklyFatigue(memberId, monday);
    }

    // 주간 걸음수 합계
    public List<FatigueService.Record> weeklyFootSteps(Integer memberId, LocalDate monday){
        return IntStream.range(0,7).mapToObj(i -> {
            LocalDate d = monday.plusDays(i);
            int steps = healthRepo.sumStepsOfDay(memberId, s(d), e(d));
            return new FatigueService.Record(dayKey(d.getDayOfWeek()), steps);
        }).toList();
    }

    private static String dayKey(DayOfWeek dow){
        return switch (dow){
            case MONDAY -> "mon"; case TUESDAY -> "tue"; case WEDNESDAY -> "wed";
            case THURSDAY -> "thu"; case FRIDAY -> "fri"; case SATURDAY -> "sat";
            default -> "sun";
        };
    }
}
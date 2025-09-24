// S13P21A305.dgg.fatigue.service.FatigueService
package S13P21A305.dgg.fatigue.service;

import S13P21A305.dgg.fatigue.dto.response.FatigueResponse;
import S13P21A305.dgg.fatigue.dto.request.FatigueUpdateRequest;
import S13P21A305.dgg.fatigue.repository.FatigueLogRepository;
import S13P21A305.dgg.fatigue.domain.FatigueLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;
import java.util.stream.IntStream;

@Service @RequiredArgsConstructor
public class FatigueService {

    private final FatigueLogRepository repo;
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static LocalDateTime s(LocalDate d){ return d.atStartOfDay(); }
    private static LocalDateTime e(LocalDate d){ return d.plusDays(1).atStartOfDay(); }

    public int currentFatigue(Integer memberId) {
        LocalDate today = LocalDate.now(KST);
        return repo.findTopByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc(memberId, s(today), e(today))
                .map(FatigueLog::getFatigue).orElse(0);
    }

    @Transactional
    public FatigueResponse update(Integer memberId, FatigueUpdateRequest req) {
        LocalDateTime now = LocalDateTime.now(KST);
        LocalDate day = now.toLocalDate();

        int base = repo.findTopByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc(memberId, s(day), e(day))
                .map(FatigueLog::getFatigue).orElse(0);

        int requested = req.getFatigue_change();   // 사용자가 요청한 증감값
        int applied = requested;                   // 실제로 적용할 증감값
        int updated = base + req.getFatigue_change();

        if (requested < 0 && updated < 0) {
            applied = -base;        // 0 아래 방지
            updated = 0;
        } else if (requested > 0 && updated > 100) {
            applied = 100 - base;   // 100 초과 방지
            updated = 100;
        }

        FatigueLog l = new FatigueLog();
        l.setMemberId(memberId);
        l.setReason(req.getReason());
        l.setFatigueChange(applied);
        l.setFatigue(updated);
        l.setCreatedAt(now);
        repo.save(l);

        return FatigueResponse.builder()
                .created_at(l.getCreatedAt())
                .reason(l.getReason())
                .fatigue(l.getFatigue())
                .fatigue_change(l.getFatigueChange())
                .build();
    }

    public List<FatigueLog> todayHistory(Integer memberId) {
        LocalDate today = LocalDate.now(KST);
        return repo.findByMemberIdAndCreatedAtBetweenOrderByCreatedAtAsc(memberId, s(today), e(today));
    }

    // 주간 피로도(각 날짜 마지막값)
    public List<Record> weeklyFatigue(Integer memberId, LocalDate monday) {
        return IntStream.range(0,7).mapToObj(i -> {
            LocalDate d = monday.plusDays(i);
            int v = repo.findTopByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc(memberId, s(d), e(d))
                    .map(FatigueLog::getFatigue).orElse(0);
            return new Record(dayKey(d.getDayOfWeek()), v);
        }).toList();
    }

    private static String dayKey(DayOfWeek dow){
        return switch (dow){
            case MONDAY -> "mon"; case TUESDAY -> "tue"; case WEDNESDAY -> "wed";
            case THURSDAY -> "thu"; case FRIDAY -> "fri"; case SATURDAY -> "sat";
            default -> "sun";
        };
    }

    public record Record(String day, int value) {}
}

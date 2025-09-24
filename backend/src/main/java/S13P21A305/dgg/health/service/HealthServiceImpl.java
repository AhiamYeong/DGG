// service/HealthServiceImpl.java
package S13P21A305.dgg.health.service;

import S13P21A305.dgg.health.dto.request.ActivityUpsertRequest;
import S13P21A305.dgg.health.dto.request.SleepUpdateRequest;
import S13P21A305.dgg.health.domain.HealthInfoDaily;
import S13P21A305.dgg.health.domain.HealthInfoLog;
import S13P21A305.dgg.health.repository.HealthInfoDailyRepository;
import S13P21A305.dgg.health.repository.HealthInfoLogRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;

@Service
@RequiredArgsConstructor
public class HealthServiceImpl implements HealthService {

    private final HealthInfoDailyRepository dailyRepo;
    private final HealthInfoLogRepository logRepo;
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");


    // === 수면 기반 일일 UPSERT ===
    // service/HealthServiceImpl.java

    @Transactional
    @Override
    public void upsertDailyBySleep(Integer memberId, SleepUpdateRequest req) {
        // === 1. 기본 시간 변환 (Instant → KST) ===
        ZoneId KST = ZoneId.of("Asia/Seoul");

        LocalDateTime sleepStart = (req.sleepStartMs() != null)
                ? Instant.ofEpochMilli(req.sleepStartMs()).atZone(KST).toLocalDateTime()
                : req.sleepDate().atZone(KST).toLocalDateTime();

        // 🕕 새벽 6시 이전이면 전날로
        LocalDate targetDay = sleepStart.toLocalTime().isBefore(LocalTime.of(6, 0))
                ? sleepStart.toLocalDate().minusDays(1)
                : sleepStart.toLocalDate();

        LocalDateTime dayKey = targetDay.atStartOfDay(); // DB 키용 (KST 자정)

        // === 2. 수면 시간(분) 계산 ===
        int actualMin = req.sleepDurationMin();
        if (actualMin == 0 && req.sleepStartMs() != null && req.sleepEndMs() != null) {
            long diffMs = Math.max(0L, req.sleepEndMs() - req.sleepStartMs());
            actualMin = (int) Math.round(diffMs / 1000.0 / 60.0);
        }

        // === 3. 스트레스 지표 계산 ===
        int stress = computeStress(
                req.sleepScore(),
                req.sleepGoalMin(),
                actualMin,
                req.activeCalories(),
                req.activitySec()
        );

        // === 4. UPSERT ===
        var row = dailyRepo.findByMemberIdAndCreatedAt(memberId, dayKey)
                .orElseGet(() -> {
                    var d = new HealthInfoDaily();
                    d.setMemberId(memberId);
                    d.setCreatedAt(dayKey); // 한국 시각 자정
                    return d;
                });
        row.setStress(stress);

        dailyRepo.save(row);
    }


    @Transactional
    @Override
    public void appendActivity(Integer memberId, ActivityUpsertRequest req) {
        // 1) 원본 10분 스냅샷 로그: windowEnd 그대로 저장 (절대 startAt로 바꾸지 않음)
        var log = new HealthInfoLog();
        log.setMemberId(memberId);
        log.setFootStep((int) req.totalStep());

        LocalDateTime kstLocal = LocalDateTime.ofInstant(req.windowEnd(), KST);
        log.setCreatedAt(kstLocal);
        logRepo.save(log);

        // 2) 일별 집계: windowEnd의 "그 날" 자정으로 dayKey 설정
        LocalDate day = kstLocal.toLocalDate();
        LocalDateTime dayKey = day.atStartOfDay();

        var daily = dailyRepo.findByMemberIdAndCreatedAt(memberId, dayKey)
                .orElseGet(() -> {
                    var d = new HealthInfoDaily();
                    d.setMemberId(memberId);
                    d.setCreatedAt(dayKey); // 자정 고정
                    d.setStress(null);
                    d.setFootStep(0);
                    return d;
                });

        int newSteps = (daily.getFootStep() == null ? 0 : daily.getFootStep())
                + (int) req.totalStep();
        daily.setFootStep(newSteps);
        dailyRepo.save(daily);
    }

    // --- 간단한 스트레스 지수 샘플(자리표시자) ---
    // 필요 시 가중치 조정해서 알려줘. 그대로 바꿔줄게.
    private int computeStress(int sleepScore, int goalMin, int actualMin,
                              double activeCal, int activitySec) {
        if(sleepScore == 0)
            return 50;
        double sleepAdeq = goalMin<=0 ? 1.0 : Math.min(1.2, (double)actualMin/goalMin); // 1.0이 목표 충족
        double actLoad = (activeCal/500.0) + (activitySec/3600.0); // 0~대략 1.x
        double base = 100 - sleepScore; // 점수 낮을수록 스트레스↑
        double stress = base * (2.0 - Math.min(1.5, sleepAdeq)) + (actLoad*10);

        return (int)Math.max(0, Math.min(100, Math.round(stress)));
    }


}

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

    // === 수면 기반 일일 UPSERT ===
    @Transactional
    @Override
    public void upsertDailyBySleep(Long memberId, SleepUpdateRequest req) {
        var dayKey = req.sleepDate().atStartOfDay(); // created_at(일자키)

        // 실제 수면 분 계산
        Integer actualMin = null;
        if (req.sleepStartMs()!=null && req.sleepEndMs()!=null) {
            long diffMs = Math.max(0, req.sleepEndMs() - req.sleepStartMs());
            actualMin = (int)Math.round(diffMs / 1000.0 / 60.0);
        }

        int stress = computeStress(
                req.sleepScore(),
                req.sleepGoalMin(),
                actualMin==null ? 0 : actualMin,
                req.activeCalories(),
                req.activitySec()
        );

        var row = dailyRepo.findByMemberIdAndCreatedAt(memberId, dayKey)
                .orElseGet(() -> {
                    var d = new HealthInfoDaily();
                    d.setMemberId(memberId);
                    d.setCreatedAt(dayKey);
                    return d;
                });

        row.setStress(stress);
        // footStep은 활동 로그 집계로 덮어질 수 있으니 여기서는 유지(선택)
        dailyRepo.save(row); // ← **UPSERT** (존재하면 UPDATE, 없으면 INSERT)
    }

    // === 활동 로그 INSERT ===
    @Transactional
    @Override
    public void appendActivity(Long memberId, ActivityUpsertRequest req) {
        var log = new HealthInfoLog();
        log.setMemberId(memberId);
        log.setFootStep((int)Math.min(Integer.MAX_VALUE, req.totalStep()));
        log.setCreatedAt(req.windowEnd().toLocalDateTime());
        logRepo.save(log);

        // 옵션) 당일 집계 업데이트: 걸음 합산
        var dayKey = req.windowEnd().toLocalDate().atStartOfDay();
        var daily = dailyRepo.findByMemberIdAndCreatedAt(memberId, dayKey)
                .orElseGet(() -> {
                    var d = new HealthInfoDaily();
                    d.setMemberId(memberId);
                    d.setCreatedAt(dayKey);
                    d.setStress(null);
                    d.setFootStep(0);
                    return d;
                });
        int newSteps = (daily.getFootStep()==null?0:daily.getFootStep())
                + (int)Math.min(Integer.MAX_VALUE, req.totalStep());
        daily.setFootStep(newSteps);
        dailyRepo.save(daily); // ← **UPSERT**
    }

    // --- 간단한 스트레스 지수 샘플(자리표시자) ---
    // 필요 시 가중치 조정해서 알려줘. 그대로 바꿔줄게.
    private int computeStress(int sleepScore, int goalMin, int actualMin,
                              double activeCal, int activitySec) {

        double sleepAdeq = goalMin<=0 ? 1.0 : Math.min(1.2, (double)actualMin/goalMin); // 1.0이 목표 충족
        double actLoad = (activeCal/500.0) + (activitySec/3600.0); // 0~대략 1.x
        double base = 100 - sleepScore; // 점수 낮을수록 스트레스↑
        double stress = base * (2.0 - Math.min(1.5, sleepAdeq)) + (actLoad*10);

        return (int)Math.max(0, Math.min(100, Math.round(stress)));
    }
}

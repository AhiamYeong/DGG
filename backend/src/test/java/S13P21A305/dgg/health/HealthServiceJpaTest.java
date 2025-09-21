package S13P21A305.dgg.health;

import S13P21A305.dgg.health.dto.request.ActivityUpsertRequest;
import S13P21A305.dgg.health.dto.request.SleepUpdateRequest;
import S13P21A305.dgg.health.domain.HealthInfoDaily;
import S13P21A305.dgg.health.repository.HealthInfoDailyRepository;
import S13P21A305.dgg.health.repository.HealthInfoLogRepository;
import S13P21A305.dgg.health.service.HealthServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@DataJpaTest
@Import(HealthServiceImpl.class) // 서비스 빈 주입 (리포지토리는 @DataJpaTest가 올려줌)
class HealthServiceJpaTest {

    @Autowired HealthServiceImpl svc;
    @Autowired HealthInfoDailyRepository dailyRepo;
    @Autowired HealthInfoLogRepository logRepo;

    @Test
    void 수면_업서트_하루1행_저장() {
        var date = LocalDate.of(2025, 9, 21);
        var req = new SleepUpdateRequest(
                date, 80, 420,
                1758125400000L, 1758147000000L, // 샘플
                200.0, 1800
        );

        svc.upsertDailyBySleep(1L, req);

        var saved = dailyRepo.findByMemberIdAndCreatedAt(1L, date.atStartOfDay()).orElseThrow();
        assertThat(saved.getStress()).isNotNull();
        assertThat(saved.getMemberId()).isEqualTo(1L);
    }

    @Test
    void 활동로그_INSERT_후_일일걸음_합산() {
        var t1 = OffsetDateTime.of(2025,9,21,9,10,0,0, ZoneOffset.ofHours(9));
        var t2 = t1.plusMinutes(10);

        svc.appendActivity(1L, new ActivityUpsertRequest(t1, 300,120,10.5,15.0,240.0));
        svc.appendActivity(1L, new ActivityUpsertRequest(t2, 450,180,12.0,18.0,360.0));

        assertThat(logRepo.count()).isEqualTo(2);
        var daily = dailyRepo.findByMemberIdAndCreatedAt(1L, t1.toLocalDate().atStartOfDay()).orElseThrow();
        assertThat(daily.getFootStep()).isEqualTo(750);
    }
}

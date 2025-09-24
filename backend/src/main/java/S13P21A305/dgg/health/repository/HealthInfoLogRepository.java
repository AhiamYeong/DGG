// health/repository/HealthInfoLogRepository.java
package S13P21A305.dgg.health.repository;

import S13P21A305.dgg.health.domain.HealthInfoLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface HealthInfoLogRepository extends JpaRepository<HealthInfoLog, Long> {

    // 하루 걸음수 합계
    @Query("select coalesce(sum(h.footStep),0) from HealthInfoLog h " +
            "where h.memberId=:memberId and h.createdAt between :from and :to")
    int sumStepsOfDay(@Param("memberId") Integer memberId,
                      @Param("from") LocalDateTime from,
                      @Param("to") LocalDateTime to);
}

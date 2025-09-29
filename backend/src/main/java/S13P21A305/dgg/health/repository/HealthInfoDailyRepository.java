package S13P21A305.dgg.health.repository;

import S13P21A305.dgg.health.domain.HealthInfoDaily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface HealthInfoDailyRepository extends JpaRepository<HealthInfoDaily, Long> {
    Optional<HealthInfoDaily> findByMemberIdAndCreatedAt(Integer memberId, LocalDateTime createdAt);
}


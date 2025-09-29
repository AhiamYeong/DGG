package S13P21A305.dgg.fatigue.repository;

import S13P21A305.dgg.fatigue.domain.FatigueLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FatigueLogRepository extends JpaRepository<FatigueLog, Integer> {

    // 그날 마지막 1건
    Optional<FatigueLog> findTopByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Integer memberId, LocalDateTime from, LocalDateTime to);

    // 그날 히스토리
    List<FatigueLog> findByMemberIdAndCreatedAtBetweenOrderByCreatedAtAsc(
            Integer memberId, LocalDateTime from, LocalDateTime to);
}

package S13P21A305.dgg.alarm.repository;

import S13P21A305.dgg.alarm.domain.AlarmEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlarmEventRepository extends JpaRepository<AlarmEvent, Long> {
    List<AlarmEvent> findByMemberIdOrderByDepartureAtDesc(Integer memberId);
}
package S13P21A305.dgg.alarm.repository;

import S13P21A305.dgg.alarm.domain.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByMemberIdAndAlarmEventId(Integer memberId, Long alarmEventId);

    List<Reminder> findByAlarmEventId(Long alarmEventId);

    // "가장 가까운 알람" 1건
    Optional<Reminder>
    findFirstByMemberIdAndEnabledTrueAndSentAtIsNullAndScheduledAtAfterOrderByScheduledAtAsc(
            Integer memberId, LocalDateTime now
    );

    // 알람 on/off 토글을 리마인더에 일괄 반영 (성능 위해 벌크 업데이트)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
      update Reminder r
         set r.enabled = :active
       where r.memberId = :memberId
         and r.alarmEventId = :alarmId
    """)
    int bulkToggleByEvent(@Param("alarmId") Long alarmId,
                          @Param("memberId") Integer memberId,
                          @Param("active") boolean active);

    // 멤버의 활성 리마인더만 조회 (리스트 화면용)
    List<Reminder> findByMemberIdAndEnabledTrue(Integer memberId);

    @Query("""
  select r
    from Reminder r
   where r.enabled = true
     and r.sentAt is null
     and r.scheduledAt <= :now
   order by r.scheduledAt asc
""")
    List<Reminder> findDueReminders(@Param("now") java.time.LocalDateTime now);

}

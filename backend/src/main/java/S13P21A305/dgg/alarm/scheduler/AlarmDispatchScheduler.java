// AlarmDispatchScheduler.java
package S13P21A305.dgg.alarm.job;

import S13P21A305.dgg.alarm.domain.AlarmEvent;
import S13P21A305.dgg.alarm.domain.Reminder;
import S13P21A305.dgg.alarm.fcm.FcmService;
import S13P21A305.dgg.alarm.repository.AlarmEventRepository;
import S13P21A305.dgg.alarm.repository.ReminderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class AlarmDispatchScheduler {

    private final ReminderRepository reminderRepo;
    private final AlarmEventRepository eventRepo;
    private final FcmService fcm;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // 매 30초
    @Scheduled(fixedDelay = 30_000L, initialDelay = 10_000L)
    @Transactional
    public void dispatchDue() {
        LocalDateTime now = LocalDateTime.now();
        var due = reminderRepo.findDueReminders(now);
        if (due.isEmpty()) return;

        // eventId -> event 캐시
        var eventIds = due.stream().map(Reminder::getAlarmEventId).collect(java.util.stream.Collectors.toSet());
        Map<Long, AlarmEvent> evMap = new HashMap<>();
        eventRepo.findAllById(eventIds).forEach(e -> evMap.put(e.getId(), e));

        // member 별로 묶어서 전송(토큰 조회/멀티캐스트 효율)
        Map<Integer, List<Reminder>> byMember = new HashMap<>();
        for (Reminder r : due) byMember.computeIfAbsent(r.getMemberId(), k -> new ArrayList<>()).add(r);

        for (var entry : byMember.entrySet()) {
            Integer memberId = entry.getKey();
            for (Reminder r : entry.getValue()) {
                var e = evMap.get(r.getAlarmEventId());
                if (e == null) continue;

                String title = r.getOffsetMin() + "분 전 알림";
                String body  = "[" + e.getTitle() + "] " + e.getDepartureName() + " → " + e.getDestinationName()
                        + " / 출발 " + e.getDepartureAt().format(FMT);

                var res = fcm.sendToMember(memberId, title, body, Map.of(
                        "kind", "alarm",
                        "alarmId", String.valueOf(r.getId()),
                        "eventId", String.valueOf(e.getId())
                ));

                if (res.failure() == 0 && res.total() > 0 && res.success() > 0) {
                    r.setSentAt(LocalDateTime.now());
                    r.setLastError(null);
                } else if (res.total() == 0) {
                    // 보낼 토큰이 없으면 실패 카운트만 올리고 다음 주기에 재시도
                    r.setFailCount(r.getFailCount() + 1);
                    r.setLastError("NO_ACTIVE_TOKENS");
                } else {
                    r.setFailCount(r.getFailCount() + res.failure());
                    r.setLastError(res.error() != null ? res.error() : "PARTIAL_FAIL");
                    // 부분 성공이어도 재중복 방지를 원하면 sent_at을 찍고 끝내도 됨(정책 선택)
                    r.setSentAt(LocalDateTime.now());
                }
                reminderRepo.save(r);
            }
        }
        log.info("[ALARM] dispatched count={}", due.size());
    }
}

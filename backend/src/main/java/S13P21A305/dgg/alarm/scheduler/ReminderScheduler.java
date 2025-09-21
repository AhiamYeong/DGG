package S13P21A305.dgg.alarm.scheduler;

import S13P21A305.dgg.alarm.domain.Reminder;
import S13P21A305.dgg.alarm.fcm.FcmService;
import S13P21A305.dgg.alarm.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final ReminderRepository reminderRepository;
    private final FcmService fcmService;

    // 매 30초마다 체크
    @Scheduled(fixedDelay = 30_000)
    public void pollAndSend() {
        LocalDateTime now = LocalDateTime.now();
        // 조건: scheduled_at <= now, sent_at is null, enabled=true
        List<Reminder> due = reminderRepository.findAll().stream()
                .filter(r -> Boolean.TRUE.equals(r.getEnabled()))
                .filter(r -> r.getSentAt() == null)
                .filter(r -> !r.getScheduledAt().isAfter(now))
                .limit(50) // 과도한 동시 처리 방지
                .toList();

        if (due.isEmpty()) return;

        log.info("[Reminder] due count={}", due.size());
        for (Reminder r : due) {
            try {
                var result = fcmService.sendToMember(
                        r.getMemberId(),
                        "출발 알림",
                        "약속 시간이 다가왔어요!",
                        Map.of("reminderId", String.valueOf(r.getId()))
                );
                if (result.success() > 0) {
                    r.setSentAt(LocalDateTime.now());
                    r.setFailCount(0);
                    r.setLastError(null);
                    reminderRepository.save(r);
                    log.info("[Reminder] sent id={}, success={}", r.getId(), result.success());
                } else {
                    r.setFailCount(r.getFailCount() + 1);
                    r.setLastError(result.error());
                    reminderRepository.save(r);
                    log.warn("[Reminder] send fail id={}, err={}", r.getId(), result.error());
                }
            } catch (Exception e) {
                r.setFailCount(r.getFailCount() + 1);
                r.setLastError(e.getMessage());
                reminderRepository.save(r);
                log.error("[Reminder] exception id={}, msg={}", r.getId(), e.getMessage(), e);
            }
        }
    }
}

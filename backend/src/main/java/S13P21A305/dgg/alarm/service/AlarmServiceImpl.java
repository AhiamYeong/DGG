// AlarmServiceImpl.java
package S13P21A305.dgg.alarm.service;

import S13P21A305.dgg.alarm.domain.AlarmEvent;
import S13P21A305.dgg.alarm.domain.Reminder;
import S13P21A305.dgg.alarm.dto.request.*;
import S13P21A305.dgg.alarm.dto.response.AlarmItemResponse;
import S13P21A305.dgg.alarm.dto.response.NextAlarmResponse;
import S13P21A305.dgg.alarm.fcm.FcmService;
import S13P21A305.dgg.alarm.repository.AlarmEventRepository;
import S13P21A305.dgg.alarm.repository.ReminderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlarmServiceImpl implements AlarmService {

    private final AlarmEventRepository eventRepo;
    private final ReminderRepository reminderRepo;
    private final FcmService fcm;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /* Query */

    @Override
    @Transactional
    public List<AlarmItemResponse> list(Integer memberId) {
        var reminders = reminderRepo.findByMemberId(memberId);
        var eventIds = reminders.stream().map(Reminder::getAlarmEventId).collect(Collectors.toSet());
        var events = eventRepo.findAllById(eventIds).stream()
                .collect(Collectors.toMap(AlarmEvent::getId, e -> e));

        return reminders.stream()
                .sorted(Comparator.comparing(Reminder::getScheduledAt).reversed())
                .map(r -> toItem(r, events.get(r.getAlarmEventId())))
                .toList();
    }

    /* Create */

    @Override
    @Transactional
    public List<AlarmItemResponse> create(AlarmCreateRequest req) {
        var e = new AlarmEvent();
        e.setMemberId(req.memberId());
        e.setTitle(req.eventTitle());
        e.setTargetType(AlarmEvent.TargetType.CUSTOM);
        e.setTargetId(null);
        e.setDepartureAt(req.departureTime());
        e.setDepartureName(req.departure());
        e.setDestinationName(req.destination());
        eventRepo.save(e);

        var uniq = new HashSet<>(req.offsetMinutesList());
        var out = new ArrayList<AlarmItemResponse>();
        for (Integer off : uniq) {
            if (off == null) continue;
            var r = new Reminder();
            r.setMemberId(req.memberId());
            r.setAlarmEventId(e.getId());
            r.setOffsetMin(off);
            r.setEnabled(Boolean.TRUE.equals(req.enabled()));
            r.setScheduledAt(e.getDepartureAt().minusMinutes(off));
            reminderRepo.save(r);
            out.add(toItem(r, e));
        }
        return out;
    }

    /* Update (event + offsets) */

    @Override
    @Transactional
    public List<AlarmItemResponse> update(Long eventId, AlarmUpdateRequest req) {
        var e = eventRepo.findById(eventId).orElseThrow();
        requireOwner(e.getMemberId(), req.memberId());

        boolean departureChanged = false;
        if (req.eventTitle() != null) e.setTitle(req.eventTitle());
        if (req.departureTime() != null) { e.setDepartureAt(req.departureTime()); departureChanged = true; }
        if (req.departure() != null) e.setDepartureName(req.departure());
        if (req.destination() != null) e.setDestinationName(req.destination());
        eventRepo.save(e);

        if (req.offsetMinutesList() != null) {
            upsertOffsetsInternal(eventId, req.memberId(), e.getDepartureAt(), new HashSet<>(req.offsetMinutesList()));
        } else if (departureChanged) {
            for (var r : reminderRepo.findByAlarmEventId(eventId)) {
                r.setScheduledAt(e.getDepartureAt().minusMinutes(r.getOffsetMin()));
                reminderRepo.save(r);
            }
        }

        return reminderRepo.findByAlarmEventId(eventId).stream()
                .map(r -> toItem(r, e))
                .sorted(Comparator.comparing(AlarmItemResponse::offsetMinutes))
                .toList();
    }


    /* Toggle (reminder one) */

    @Override
    @Transactional
    public void toggle(Long alarmId, AlarmToggleRequest req) {
        var r = reminderRepo.findById(alarmId).orElseThrow();
        requireOwner(r.getMemberId(), req.memberId());
        r.setEnabled(req.enabled());
        reminderRepo.save(r);
    }

    /* Delete (reminder one) */

    @Override
    @Transactional
    public List<AlarmItemResponse> delete(Long alarmId, Integer memberId) {
        var r = reminderRepo.findById(alarmId).orElseThrow();
        requireOwner(r.getMemberId(), memberId);
        reminderRepo.delete(r);
        return list(memberId);
    }

    /* Next */

    @Override
    @Transactional
    public Optional<NextAlarmResponse> next(Integer memberId) {
        LocalDateTime now = LocalDateTime.now();
        var rOpt = reminderRepo
                .findFirstByMemberIdAndEnabledTrueAndSentAtIsNullAndScheduledAtAfterOrderByScheduledAtAsc(memberId, now);

        if (rOpt.isEmpty()) return Optional.empty();
        var r = rOpt.get();
        var e = eventRepo.findById(r.getAlarmEventId()).orElse(null);
        if (e == null) return Optional.empty();

        return Optional.of(new NextAlarmResponse(
                e.getTitle(),
                e.getDepartureAt().format(FMT),
                e.getDepartureName(),
                e.getDestinationName(),
                r.getOffsetMin()
        ));
    }

    /* Manual push now (FCM) */

    @Override
    @Transactional
    public Map<String, Object> pushNow(Long alarmId, Integer memberId) {
        var r = reminderRepo.findById(alarmId).orElseThrow();
        requireOwner(r.getMemberId(), memberId);
        var e = eventRepo.findById(r.getAlarmEventId()).orElseThrow();

        String title = r.getOffsetMin() + "분 전 알림";
        String body  = "[" + e.getTitle() + "] " + e.getDepartureName() + " → " + e.getDestinationName();

        var res = fcm.sendToMember(memberId, title, body, Map.of(
                "kind", "alarm",
                "alarmId", String.valueOf(r.getId()),
                "eventId", String.valueOf(e.getId())
        ));

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("total", res.total());
        map.put("success", res.success());
        map.put("failure", res.failure());
        if (res.error() != null) map.put("error", res.error());
        return map;
    }

    /* helpers */

    private AlarmItemResponse toItem(Reminder r, AlarmEvent e) {
        String title = r.getOffsetMin() + "분 전 알림";
        return new AlarmItemResponse(
                r.getId(),
                e != null ? e.getId() : null,
                title,
                e != null ? e.getTitle() : null,
                e != null ? e.getDepartureAt().format(FMT) : null,
                e != null ? e.getDepartureName() : null,
                e != null ? e.getDestinationName() : null,
                r.getOffsetMin(),
                Boolean.TRUE.equals(r.getEnabled())
        );
    }

    private void upsertOffsets(AlarmEvent e, Integer memberId, Set<Integer> want) {
        var existing = reminderRepo.findByMemberIdAndAlarmEventId(memberId, e.getId());
        var have = existing.stream().map(Reminder::getOffsetMin).collect(Collectors.toSet());

        for (Integer off : want) {
            if (!have.contains(off)) {
                var r = new Reminder();
                r.setMemberId(memberId);
                r.setAlarmEventId(e.getId());
                r.setOffsetMin(off);
                r.setEnabled(true);
                r.setScheduledAt(e.getDepartureAt().minusMinutes(off));
                reminderRepo.save(r);
            }
        }
        for (Reminder r : existing) {
            if (want.contains(r.getOffsetMin())) {
                r.setEnabled(true);
                r.setScheduledAt(e.getDepartureAt().minusMinutes(r.getOffsetMin()));
            } else {
                r.setEnabled(false);
            }
            reminderRepo.save(r);
        }
    }

    private void requireOwner(Integer ownerId, Integer memberId) {
        if (!Objects.equals(ownerId, memberId)) throw new IllegalStateException("FORBIDDEN");
    }

    private void upsertOffsetsInternal(Long alarmEventId,
                                       Integer memberId,
                                       LocalDateTime departureAt,
                                       Set<Integer> want) {
        var existing = reminderRepo.findByMemberIdAndAlarmEventId(memberId, alarmEventId);
        var have = existing.stream().map(Reminder::getOffsetMin).collect(Collectors.toSet());

        // 추가
        for (Integer off : want) {
            if (!have.contains(off)) {
                var r = new Reminder();
                r.setMemberId(memberId);
                r.setAlarmEventId(alarmEventId);
                r.setOffsetMin(off);
                r.setEnabled(true);
                r.setScheduledAt(departureAt.minusMinutes(off));
                reminderRepo.save(r);
            }
        }

        // 유지/비활성
        for (Reminder r : existing) {
            if (want.contains(r.getOffsetMin())) {
                r.setEnabled(true);
                r.setScheduledAt(departureAt.minusMinutes(r.getOffsetMin()));
            } else {
                r.setEnabled(false);
            }
            reminderRepo.save(r);
        }
    }

}

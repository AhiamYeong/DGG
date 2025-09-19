package S13P21A305.dgg.alarm.service;


import S13P21A305.dgg.alarm.domain.AlarmEvent;
import S13P21A305.dgg.alarm.domain.Reminder;
import S13P21A305.dgg.alarm.dto.request.AlarmCreateRequest;
import S13P21A305.dgg.alarm.dto.request.AlarmUpdateRequest;
import S13P21A305.dgg.alarm.dto.response.AlarmResponse;
import S13P21A305.dgg.alarm.dto.response.NextAlarmResponse;
import S13P21A305.dgg.alarm.repository.AlarmEventRepository;
import S13P21A305.dgg.alarm.repository.ReminderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlarmServiceImpl implements AlarmService {

    private final AlarmEventRepository eventRepo;
    private final ReminderRepository reminderRepo;

    @Transactional
    @Override
    public List<AlarmResponse> list(Integer memberId) {
        var events = eventRepo.findByMemberIdOrderByDepartureAtDesc(memberId);
        var reminders = reminderRepo.findByMemberIdAndEnabledTrue(memberId)
                .stream().collect(Collectors.groupingBy(Reminder::getAlarmEventId));

        return events.stream().map(e -> new AlarmResponse(
                e.getId(), e.getMemberId(), e.getTitle(),
                e.getTargetType().name(), e.getTargetId(),
                e.getDepartureAt(), e.getDepartureName(), e.getDestinationName(),
                reminders.getOrDefault(e.getId(), List.of()).stream()
                        .map(Reminder::getOffsetMin).sorted().toList()
        )).toList();
    }


    @Override
    @Transactional
    public Long create(AlarmCreateRequest req) {
        var e = new AlarmEvent();
        e.setMemberId(req.memberId());
        e.setTitle(req.title());
        e.setTargetType(AlarmEvent.TargetType.valueOf(req.targetType()));
        e.setTargetId(req.targetId());
        e.setDepartureAt(req.departureAt());
        e.setDepartureName(req.departureName());
        e.setDestinationName(req.destinationName());
        eventRepo.save(e);

        if (req.offsets() != null) {
            var offs = new HashSet<>(req.offsets());
            for (Integer off : offs) {
                if (off == null) continue;
                var r = new Reminder();
                r.setMemberId(req.memberId());
                r.setAlarmEventId(e.getId());
                r.setOffsetMin(off);
                r.setEnabled(true);
                r.setScheduledAt(e.getDepartureAt().minusMinutes(off));
                reminderRepo.save(r);
            }
        }
        return e.getId();
    }

    @Override
    @Transactional
    public void update(Long id, Integer memberId, AlarmUpdateRequest req) {
        var e = eventRepo.findById(id).orElseThrow();
        requireOwner(e.getMemberId(), memberId);

        boolean departureChanged = false;
        if (req.title() != null) e.setTitle(req.title());
        if (req.departureAt() != null) { e.setDepartureAt(req.departureAt()); departureChanged = true; }
        if (req.departureName() != null) e.setDepartureName(req.departureName());
        if (req.destinationName() != null) e.setDestinationName(req.destinationName());
        eventRepo.save(e);

        // offsets가 넘어오면 upsert/disable
        if (req.offsets() != null) {
            upsertOffsetsInternal(id, memberId, e.getDepartureAt(), new HashSet<>(req.offsets()));
        } else if (departureChanged) {
            // 출발시각만 변경 → 기존 리마인더 재계산
            for (Reminder r : reminderRepo.findByAlarmEventId(id)) {
                r.setScheduledAt(e.getDepartureAt().minusMinutes(r.getOffsetMin()));
                reminderRepo.save(r);
            }
        }
    }

    @Override
    @Transactional
    public void delete(Long id, Integer memberId) {
        var e = eventRepo.findById(id).orElseThrow();
        requireOwner(e.getMemberId(), memberId);
        reminderRepo.deleteAll(reminderRepo.findByAlarmEventId(id)); // FK 없음 → 수동 정리
        eventRepo.delete(e);
    }

    @Override
    @Transactional
    public Optional<NextAlarmResponse> next(Integer memberId) {
        LocalDateTime now = LocalDateTime.now();
        var rOpt = reminderRepo
                .findFirstByMemberIdAndEnabledTrueAndSentAtIsNullAndScheduledAtAfterOrderByScheduledAtAsc(memberId, now);

        if (rOpt.isEmpty()) return Optional.empty();
        var r = rOpt.get();
        var e = eventRepo.findById(r.getAlarmEventId()).orElse(null);

        return Optional.of(new NextAlarmResponse(
                r.getAlarmEventId(),
                r.getId(),
                r.getOffsetMin(),
                r.getScheduledAt(),
                e != null ? e.getTitle() : null,
                e != null ? e.getDepartureName() : null,
                e != null ? e.getDestinationName() : null
        ));
    }

    @Transactional
    @Override
    public void setActive(Long id, Integer memberId, boolean active) {
        // 이벤트 소유자 검증만 수행 (AlarmEvent에 isActive 필드 없음)
        var e = eventRepo.findById(id).orElseThrow();
        if (!e.getMemberId().equals(memberId)) throw new IllegalStateException("FORBIDDEN");

        // 이 이벤트(alarm_event_id)에 속한 리마인더들을 일괄 enable/disable
        reminderRepo.bulkToggleByEvent(id, memberId, active);
    }


    @Override
    @Transactional
    public void setOffsets(Long id, Integer memberId, List<Integer> offsets) {
        var e = eventRepo.findById(id).orElseThrow();
        requireOwner(e.getMemberId(), memberId);
        upsertOffsetsInternal(id, memberId, e.getDepartureAt(), new HashSet<>(offsets));
    }

    /* 내부 유틸 */

    private void upsertOffsetsInternal(Long alarmEventId, Integer memberId, LocalDateTime departureAt, Set<Integer> want) {
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

    private void requireOwner(Integer ownerId, Integer memberId) {
        if (!Objects.equals(ownerId, memberId)) {
            throw new IllegalStateException("FORBIDDEN");
        }
    }
}

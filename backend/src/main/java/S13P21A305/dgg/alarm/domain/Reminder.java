package S13P21A305.dgg.alarm.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@Entity
@Table(name="reminder",
        indexes = {
                // 실제 컬럼명 기준으로!
                @Index(name="idx_reminder_due", columnList="scheduled_at,status,sent_at"),
                @Index(name="idx_reminder_member", columnList="member_id"),
                @Index(name="idx_reminder_event", columnList="alarm_event_id")
        },
        uniqueConstraints = @UniqueConstraint(
                name="uq_member_event_offset",
                columnNames = {"member_id","alarm_event_id","offset_min"}
        )
)
public class Reminder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false)
    private Integer memberId;

    @Column(name="alarm_event_id", nullable=false)
    private Long alarmEventId;

    @Column(name="offset_min", nullable=false)
    private Integer offsetMin; // 10/30/60

    // DB는 TINYINT(1) status 컬럼 → 코드에선 enabled로 사용
    @Column(name="status", nullable=false)
    private Boolean enabled = true;

    @Column(name="scheduled_at", nullable=false)
    private LocalDateTime scheduledAt;

    @Column(name="sent_at")
    private LocalDateTime sentAt;

    @Column(name="fail_count", nullable=false)
    private Integer failCount = 0;

    @Column(name="last_error")
    private String lastError;

    @Column(name="created_at", insertable=false, updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", insertable=false, updatable=false)
    private LocalDateTime updatedAt;
}

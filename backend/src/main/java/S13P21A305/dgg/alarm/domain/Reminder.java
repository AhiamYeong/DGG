package S13P21A305.dgg.alarm.domain;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import java.time.LocalDateTime;

@Entity @Table(name = "reminder")
@Getter @Setter
public class Reminder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false)
    private Integer memberId;

    @Column(name="alarm_event_id", nullable=false)
    private Long alarmEventId;

    @Column(name="offset_min", nullable=false)
    private Integer offsetMin;

    // status(TINYINT) ↔ enabled(boolean) 매핑
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

    @Column(name="created_at", updatable=false, insertable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", insertable=false)
    private LocalDateTime updatedAt;
}

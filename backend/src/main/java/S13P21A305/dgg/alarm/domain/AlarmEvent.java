package S13P21A305.dgg.alarm.domain;

import jakarta.persistence.*;
        import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name="alarm_event",
        indexes = {
                @Index(name="idx_alarm_event_member_time", columnList="member_id,departure_at"),
                @Index(name="idx_alarm_event_target", columnList="target_type,target_id")
        })
public class AlarmEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable=false)
    private Integer memberId;

    private String title;

    @Column(name="target_type", nullable=false, columnDefinition="enum('PLAN','ROUTE','SLEEP','CUSTOM')")
    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    @Column(name="target_id")
    private Integer targetId;

    @Column(name="departure_at", nullable=false)
    private LocalDateTime departureAt;

    @Column(name="departure_name")
    private String departureName;

    @Column(name="destination_name")
    private String destinationName;

    @Column(name="created_at", insertable=false, updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", insertable=false, updatable=false)
    private LocalDateTime updatedAt;

    public enum TargetType { PLAN, ROUTE, SLEEP, CUSTOM }
}

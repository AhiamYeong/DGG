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
                @Index(name="idx_alarm_event_member_time", columnList="memberId,departureAt"),
                @Index(name="idx_alarm_event_target", columnList="targetType,targetId")
        })
public class AlarmEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false) private Integer memberId;
    private String title;

    @Column(nullable=false, columnDefinition="enum('PLAN','ROUTE','SLEEP','CUSTOM')")
    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    private Integer targetId;

    @Column(nullable=false) private LocalDateTime departureAt;

    private String departureName;
    private String destinationName;

    @Column(name="created_at", insertable=false, updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", insertable=false, updatable=false)
    private LocalDateTime updatedAt;

    public enum TargetType { PLAN, ROUTE, SLEEP, CUSTOM }
}

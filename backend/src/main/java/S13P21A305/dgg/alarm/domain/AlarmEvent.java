package S13P21A305.dgg.alarm.domain;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import java.time.LocalDateTime;

@Entity @Table(name = "alarm_event")
@Getter @Setter
public class AlarmEvent {
    public enum TargetType { PLAN, ROUTE, SLEEP, CUSTOM }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false)
    private Integer memberId;

    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name="target_type", nullable=false)
    private TargetType targetType = TargetType.ROUTE;

    @Column(name="target_id")
    private Integer targetId;

    @Column(name="departure_at", nullable=false)
    private LocalDateTime departureAt;

    @Column(name="departure_name")
    private String departureName;

    @Column(name="destination_name")
    private String destinationName;

    @Column(name="created_at", updatable=false, insertable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", insertable=false)
    private LocalDateTime updatedAt;
}

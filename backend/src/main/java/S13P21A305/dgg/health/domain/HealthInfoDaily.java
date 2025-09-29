// entity/HealthInfoDaily.java
package S13P21A305.dgg.health.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.*;

@Entity
@Table(
        name = "health_info_daily",
        uniqueConstraints = @UniqueConstraint(name="uk_daily_member_created", columnNames={"member_id","created_at"}),
        indexes = @Index(name="idx_daily_member_created", columnList="member_id,created_at")
)
@Getter @Setter
public class HealthInfoDaily {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false)
    private Integer memberId;

    @Column(name="stress")
    private Integer stress;

    @Column(name="foot_step")
    private Integer footStep;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;
}

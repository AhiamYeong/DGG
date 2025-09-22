// entity/HealthInfoDaily.java
package S13P21A305.dgg.health.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.*;

@Entity
@Table(name = "health_info_daily",
        uniqueConstraints = @UniqueConstraint(name="uk_daily_member_date", columnNames={"member_id","created_at"}),
        indexes = @Index(name="idx_daily_member_date", columnList="member_id,created_at"))
@Getter
@Setter
public class HealthInfoDaily {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false) private Long memberId;

    @Column(name="stress") private Integer stress;     // 일평균 스트레스 지수
    @Column(name="foot_step") private Integer footStep; // 일 합계 걸음 수

    // created_at을 '그 날 00:00:00'로 고정(일자키)
    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;

    @PrePersist void prePersist(){ if(createdAt==null) createdAt=LocalDate.now().atStartOfDay(); }

    // getters/setters...
}

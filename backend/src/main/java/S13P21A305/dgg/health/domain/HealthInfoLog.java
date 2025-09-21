// entity/HealthInfoLog.java
package S13P21A305.dgg.health.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.*;

@Entity
@Table(name = "health_info_log", indexes = {
        @Index(name="idx_log_member_created", columnList="member_id,created_at")
})
@Getter
@Setter
public class HealthInfoLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false) private Long memberId;
    @Column(name="stress") private Integer stress;      // 구간 스트레스 지수(선택)
    @Column(name="foot_step") private Integer footStep; // 구간 걸음 수

    @Column(name="created_at", nullable=false) private LocalDateTime createdAt; // windowEnd

    @PrePersist void prePersist(){ if(createdAt==null) createdAt=LocalDateTime.now(); }

    // getters/setters...
}

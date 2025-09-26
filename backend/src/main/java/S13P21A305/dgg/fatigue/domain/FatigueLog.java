// entity/FatigueLog.java
package S13P21A305.dgg.fatigue.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.*;

@Entity
@Table(name="fatigue_log", indexes = {
        @Index(name="idx_fatigue_member_created", columnList="member_id,created_at")
})
@Getter
@Setter
public class FatigueLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false) private Integer memberId;
    @Column(name="fatigue") private Integer fatigue; // 당시 피로도(0~100)

    public enum Reason { TRAFFIC, COFFEE, WALK, NAP }

    @Enumerated(EnumType.STRING)
    @Column(name="reason") private Reason reason;

    @Column(name="fatigue_change") private Integer fatigueChange; // +/-

    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;

    @PrePersist void prePersist(){ if(createdAt==null) createdAt=LocalDateTime.now(); }

    // getters/setters...
}

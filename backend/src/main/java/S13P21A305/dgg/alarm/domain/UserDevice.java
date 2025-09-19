package S13P21A305.dgg.alarm.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_device",
        indexes = @Index(name = "idx_user_device_member_enabled", columnList = "member_id,is_enabled"),
        uniqueConstraints = @UniqueConstraint(name = "uq_user_device_token", columnNames = "push_token")
)
@Getter @Setter @NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDevice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable=false)
    private Integer memberId;

    @Column(name = "push_token", nullable=false, length=512)
    private String pushToken;

    @Column(name="is_enabled", nullable=false)
    private Boolean isEnabled = true;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name="created_at", insertable=false, updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", insertable=false, updatable=false)
    private LocalDateTime updatedAt;
}

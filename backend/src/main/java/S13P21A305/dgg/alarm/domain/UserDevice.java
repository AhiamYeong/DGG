package S13P21A305.dgg.alarm.domain;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import java.time.LocalDateTime;

@Entity @Table(name="user_device")
@Getter @Setter
public class UserDevice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false)
    private Integer memberId;

    @Column(name="push_token", nullable=false, unique=true, length = 512)
    private String pushToken;

    @Column(name="is_enabled", nullable=false)
    private Boolean enabled = true;

    @Column(name="last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name="created_at", updatable=false, insertable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", insertable=false)
    private LocalDateTime updatedAt;
}

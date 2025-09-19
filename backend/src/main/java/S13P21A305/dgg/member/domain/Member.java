package S13P21A305.dgg.member.domain;

import S13P21A305.dgg.member.domain.enums.MemberRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "member")
public class Member {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="google_key")
    private String googleKey; //구글 고유 id

    @Column(name="email")
    private String email;
    @Column(name="nickname")
    private String nickname; //사용자 nickname

    @Enumerated(EnumType.STRING)
    @Column(name="role")
    private MemberRole role;

    @Column(name="health_permission", insertable=false)
    private Boolean healthPermission;
    @Column(name="push_permission", insertable=false)
    private Boolean pushPermission;
    @Column(name="sleep_permission", insertable=false)
    private Boolean sleepPermission;

    @Column(name="fatigue", insertable=false)
    private Integer fatigue;
    @Column(name = "energy", insertable=false)
    private Integer energy;
    @Column(name = "foot_step", insertable=false)
    private Integer footStep;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @Column(name = "is_withdraw", insertable=false)
    private Boolean isWithdraw;

    /**
    닉네임 수정
     */
    public void updateNickname(String nickname){
        this.nickname = nickname;
    }

}

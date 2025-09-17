package S13P21A305.dgg.auth.entity;

import com.google.auto.value.AutoValue;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "member")
public class MemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="membername")
    private String membername; //구글 고유 id

    @Column(name="nickname")
    private String name; //사용자 nickname
    @Column(name="email")
    private String email;
    @Column(name="role")
    private String role;
}

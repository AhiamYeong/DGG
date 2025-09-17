package S13P21A305.dgg.member.repository;

import S13P21A305.dgg.auth.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<MemberEntity, Long> {
    MemberEntity findByMembername(String membername);
}
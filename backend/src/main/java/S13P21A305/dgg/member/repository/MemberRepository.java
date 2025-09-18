package S13P21A305.dgg.member.repository;

import S13P21A305.dgg.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByGoogleKey(String googleKey);

}
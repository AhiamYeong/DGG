package S13P21A305.dgg.member.repository;

import S13P21A305.dgg.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByGoogleKey(String googleKey);

    @Query("SELECT m.email FROM Member m WHERE m.id= :memverId")
    String findEmailById(Long memberId);
}
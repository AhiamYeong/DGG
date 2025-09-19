package S13P21A305.dgg.member.repository;

import S13P21A305.dgg.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    // 회원가입 로직에서 필요. dgg 기존 고객인지
    Member findByGoogleKey(String googleKey);

    boolean existsByNickname(String nickname);

//    @Query("SELECT m.email FROM Member m WHERE m.id= :memverId")
//    String findEmailById(Long memberId);
}
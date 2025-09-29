package S13P21A305.dgg.member.repository;

import S13P21A305.dgg.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    // 회원가입 로직에서 필요. dgg 기존 고객인지
    Member findByGoogleKey(String googleKey);

    // 닉네임이 존재하는지 찾기
    boolean existsByNickname(String nickname);

    // id 찾고 is_withdraw가 false인 것
    Optional<Member> findByIdAndIsWithdrawFalse(Integer memberId);

}
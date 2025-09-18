package S13P21A305.dgg.member.service;

import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.dto.response.ProfileResponseDto;
import S13P21A305.dgg.member.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    /**
     * 사용자 nickname, email 조회
     */
    @Transactional
    public ProfileResponseDto getProfile(Long memberId){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException(memberId + "에 해당하는 사용자가 없습니다."));

        return ProfileResponseDto.builder()
                .nickname(member.getNickname())
                .email(member.getEmail())
                .build();
    }

//    @Transactional
//    public ProfileResponseDto

}

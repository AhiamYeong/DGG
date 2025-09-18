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

    @Transactional
    public ProfileResponseDto getProfile(Long memberId){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException(memberId + "에 해당하는 사용자가 없습니다."));
        String nickname = member.getNickname();
        String email = member.getEmail();

        return ProfileResponseDto.builder()
                .nickname(nickname)
                .email(email)
                .build();
    }
}

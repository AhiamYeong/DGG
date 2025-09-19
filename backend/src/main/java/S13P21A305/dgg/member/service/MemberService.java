package S13P21A305.dgg.member.service;

import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.domain.SurveyAnswer;
import S13P21A305.dgg.member.dto.request.ProfileUpdateRequestDto;
import S13P21A305.dgg.member.dto.request.SubmitSurveyRequestDto;
import S13P21A305.dgg.member.dto.response.ProfileResponseDto;
import S13P21A305.dgg.member.dto.response.ProfileUpdateResponseDto;
import S13P21A305.dgg.member.dto.response.SubmitSurveyResponseDto;
import S13P21A305.dgg.member.dto.response.SurveyResponseDto;
import S13P21A305.dgg.member.repository.MemberRepository;
import S13P21A305.dgg.member.repository.SurveyAnswerRepository;
import S13P21A305.dgg.member.repository.SurveyQuestionRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final SurveyAnswerRepository surveyAnswerRepository;
    private final SurveyQuestionRepository surveyQuestionRepository;

    /**
     * 사용자 nickname, email 조회
     */
    @Transactional
    public ProfileResponseDto getProfile(Integer memberId){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException(memberId + "에 해당하는 사용자가 없습니다."));

        return ProfileResponseDto.builder()
                .nickname(member.getNickname())
                .email(member.getEmail())
                .build();
    }

    @Transactional
    public ProfileUpdateResponseDto updateProfile(Integer memberId, ProfileUpdateRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException(memberId + "에 해당하는 사용자가 없습니다."));
        String newNickname = request.getNickname();

        //기존 닉네임과 변경 닉네임 같으면 수정 로직 안거치고 종료
        if(newNickname.equals(member.getNickname())) {
            return ProfileUpdateResponseDto.builder()
                    .nickname(member.getNickname())
                    .build();
        }

        //중복 체크
        if(memberRepository.existsByNickname(newNickname)) {
            throw new IllegalStateException("이미 사용 중인 닉네임입니다.");
        }

        // 닉네임 변경
        member.updateNickname(newNickname);

        return ProfileUpdateResponseDto.builder()
                .nickname(member.getNickname())
                .build();
    }

    @Transactional
    public SubmitSurveyResponseDto submitSurvey(Integer memberId, List<SubmitSurveyRequestDto> request){
        // 비었는지 확인
        if(request == null || request.isEmpty()){
            throw new IllegalArgumentException("답변이 비어 있습니다.");
        }

        //request로 엔티티 값 변환
        List<SurveyAnswer> toSave = request.stream()
                .map(dto -> SurveyAnswer.builder()
                        .memberId(memberId)
                        .surveyId(dto.getSurveyQuestionId())
                        .content(dto.getAnswerValue())
                        .build())
                .toList();

        //저장
        surveyAnswerRepository.saveAll(toSave);

        //응답
        return SubmitSurveyResponseDto.builder()
                .build();
    }

    public List<SurveyResponseDto> getSurvey(Integer memberId){

        return surveyAnswerRepository.findDtosByMemberId(memberId);
    }

}

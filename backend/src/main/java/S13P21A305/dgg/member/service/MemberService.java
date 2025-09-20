package S13P21A305.dgg.member.service;

import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.domain.SurveyAnswer;
import S13P21A305.dgg.member.dto.request.ProfileUpdateRequestDto;
import S13P21A305.dgg.member.dto.request.SubmitSurveyRequestDto;
import S13P21A305.dgg.member.dto.request.UpdateSurveyRequestDto;
import S13P21A305.dgg.member.dto.response.*;
import S13P21A305.dgg.member.repository.MemberRepository;
import S13P21A305.dgg.member.repository.SurveyAnswerRepository;
import S13P21A305.dgg.member.repository.SurveyQuestionRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

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
        //사용자 존재 여부 확인
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException(memberId + "에 해당하는 사용자가 없습니다."));

        return ProfileResponseDto.builder()
                .nickname(member.getNickname())
                .email(member.getEmail())
                .build();
    }

    /**
     * 사용자 nickname 수정
     */
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

    /**
     * 설문조사 제출
     */
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

    /**
     * 설문조사 응답 조회
     */
    @Transactional
    public List<SurveyResponseDto> getSurvey(Integer memberId){

        return surveyAnswerRepository.findDtosByMemberId(memberId);
    }

    /**
     * 설문조사 응답 수정
     */
    @Transactional
    public List<SurveyResponseDto> updateSurvey(Integer memberId, List<UpdateSurveyRequestDto> request){
        if(request == null || request.isEmpty()){
            throw new IllegalArgumentException("수정할 항목이 비어 있습니다.");
        }

        // 요청 들어온 surveyId 목록
        List<Integer> surveyIds = request.stream()
                .map(UpdateSurveyRequestDto::getSurveyQuestionId)
                .toList();

        //기존 응답 로드
        List<SurveyAnswer> existing = surveyAnswerRepository.findByMemberIdAndSurveyIdIn(memberId, surveyIds);
        Map<Integer, SurveyAnswer> bySurveyId = existing.stream()
                .collect(Collectors.toMap(SurveyAnswer::getSurveyId, Function.identity()));

        //수정 or 신규 생성
        LocalDateTime now = LocalDateTime.now();
        List<SurveyAnswer> toSave = new ArrayList<>();

        for(UpdateSurveyRequestDto dto : request) {
            Integer id = dto.getSurveyQuestionId();
            Integer newValue = dto.getAnswerValue();

            SurveyAnswer r = bySurveyId.get(id);
            if(r == null) {
                r = new SurveyAnswer();
                r.setMemberId(memberId);
                r.setSurveyId(id);
                r.setContent(newValue);
                r.setCreatedAt(now);
            } else {
                r.setContent(newValue);
            }
            r.setUpdatedAt(now);
            toSave.add(r);
        }

        surveyAnswerRepository.saveAll(toSave);

        return getSurvey(memberId);
    }

}

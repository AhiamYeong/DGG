package S13P21A305.dgg.member.repository;

import S13P21A305.dgg.member.domain.SurveyAnswer;
import S13P21A305.dgg.member.dto.response.SurveyResponseDto;
import S13P21A305.dgg.member.dto.response.UpdateSurveyResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyAnswerRepository extends JpaRepository<SurveyAnswer, Integer> {
    List<SurveyAnswer> findByMemberId(Integer memberId);

    /**
     * 설문 id, 질문 내용, 응답 값을 매핑한 dto 리스트를 반환
     * @param memberId 조회할 회원
     * @return 해당 회원의 모든 설문 응답 dto 목록
     */
    @Query("""
        select new S13P21A305.dgg.member.dto.response.SurveyResponseDto(
            r.surveyId, q.content, r.content
        )
        from SurveyAnswer r
        join SurveyQuestion q on q.id = r.surveyId
        where r.memberId = :memberId
        order by r.surveyId
    """)
    List<SurveyResponseDto> findDtosByMemberId(@Param("memberId") Integer memberId);

    /**
     * 특정 회원의 응답 중, 지정한 설문 id 목록에 해당하는 응답 조회
     * @param memberId 조회할 회원
     * @param surveyIds 조회할 설문 id 목록
     * @return 조건에 맞는 설문 응답 목록
     */
    List<SurveyAnswer> findByMemberIdAndSurveyIdIn(Integer memberId, Collection<Integer> surveyIds);

    //이미 있는 survey id 목록
    @Query("select sa.surveyId " +
            "from SurveyAnswer sa " +
            "where sa.memberId = :memberId and sa.surveyId in :surveyIds")
    List<Integer> findExistingSurveyIds(@Param("memberId") Integer memberId,
                                        @Param("surveyIds") Collection<Integer> surveyIds);
}

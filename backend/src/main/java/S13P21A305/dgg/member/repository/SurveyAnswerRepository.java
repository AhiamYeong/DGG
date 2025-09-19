package S13P21A305.dgg.member.repository;

import S13P21A305.dgg.member.domain.SurveyAnswer;
import S13P21A305.dgg.member.dto.response.SurveyResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyAnswerRepository extends JpaRepository<SurveyAnswer, Integer> {
    List<SurveyAnswer> findByMemberId(Integer memberId);

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

}

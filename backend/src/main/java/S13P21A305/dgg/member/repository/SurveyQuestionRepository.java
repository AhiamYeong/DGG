package S13P21A305.dgg.member.repository;

import S13P21A305.dgg.member.domain.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestBody;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Integer> {
}

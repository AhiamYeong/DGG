package S13P21A305.dgg.member.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
//@AllArgsConstructor
//@Builder
public class SubmitSurveyRequestDto {
    Integer surveyQuestionId;
    Integer answerValue;
}

package S13P21A305.dgg.member.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SurveyResponseDto {
    Integer surveyQuestionId;
    String questionText;
    Integer answerValue;
}

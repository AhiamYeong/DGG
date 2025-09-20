package S13P21A305.dgg.member.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSurveyResponseDto {
    private Integer surveyQuestionId;
    private Integer answerValue;
}

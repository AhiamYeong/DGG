package S13P21A305.dgg.route.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RecommendedRouteDTO {
	@com.fasterxml.jackson.annotation.JsonProperty("routeId")
	private String routeKey; // 캐시 키
	private String name; // 경로이름
	private int timeTaken; // 소요시간
	private String arrivalTime;
	private int fatigue; // 피로도
}

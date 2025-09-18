package S13P21A305.dgg.global.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class OdSayResponseDTO {

	private Result result; // 최상위 객체

	@Getter
	@Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Result {
		private List<Path> path;
	}

	@Getter
	@Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Path {
		private Info info;
	}

	@Getter
	@Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Info {
		private int totalTime;
		private int busTransitCount;
		private int subwayTransitCount;
		private String firstStartStation;
		private String lastEndStation;
	}
}

package S13P21A305.dgg.global.external.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

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
		private List<SubPath> subPath;
	}

	@Getter
	@Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Info {
		private int totalTime;
		private int busTransitCount;
		private int subwayTransitCount;
		private int totalDistance;
		private String firstStartStation;
		private String lastEndStation;

		@Getter
		@JsonProperty("mapObj")
		private String mapObj;
	}

	@Getter @Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class SubPath {
		// 1=SUBWAY, 2=BUS, 3=WALK
		private int trafficType;

		// 구간별 소요되는 시간(분)
		private int sectionTime;

		private String startName;
		private String endName;

		private Double startX;  // lng 경도
		private Double startY;  // lat 위도
		private Double endX;    // lng
		private Double endY;	// lat

		private PassStopList passStopList;

		// 공통 노선 정보
		@JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
		private List<Lane> lane;
	}

	@Getter @Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class PassStopList {
		private List<Station> stations;
	}

	@Getter @Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Station {
		private Integer stationID;
		private String stationName;
		private Double x; // lng
		private Double y; // lat
	}

	@Getter @Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Lane {
		// 지하철일 때 노선 이름 (ex. 2호선)
		private String name;
		private String busNo;
		private Integer busID;

		@JsonProperty("mapObj")
		private String mapObj; // 각 서브경로 lane에 대한 mapObj 받는 케이스가 있어서 기입
	}
}

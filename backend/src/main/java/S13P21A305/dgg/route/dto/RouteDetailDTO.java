package S13P21A305.dgg.route.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RouteDetailDTO {
	private int totalTime;
	private String departureTime;
	private String arrivalTime;
	private int fatigue;
	private List<Leg> data;

	@Getter @Setter
	@NoArgsConstructor @AllArgsConstructor
	@Builder
	public static class Leg { // 경로를 이루는 구간(ex. 성수-강남 1구간)
		private int order;
		private String type; // 교통 수단
		private String lineName; // 지하철 - 2호선, 버스 - 140, 도보 - null
		private int timeTaken; // min
		private String startPoint;
		private String endPoint;

		// 좌표
		private Double startLat;
		private Double startLng;
		private Double endLat;
		private Double endLng;

		// 경유 좌표 배열
		private List<LatLngDTO> path;

		private Integer etaMin;
	}

	// 경유 좌표용 DTO
	@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
	public static class LatLngDTO { private Double lat; private Double lng; }
}

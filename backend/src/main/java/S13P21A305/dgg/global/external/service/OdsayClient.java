package S13P21A305.dgg.global.external.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class OdsayClient {

	private final RestTemplate restTemplate;

	@Value("${odsay.api.key}")
	private String apiKey;

	/** 버스노선 조회(노선번호 -> laneId, busID 등) */
	public SearchBusLaneResult searchBusLane(String busNo, int cityId) {
		URI uri = UriComponentsBuilder
			.fromHttpUrl("https://api.odsay.com/v1/api/searchBusLane")
			.queryParam("apiKey", apiKey)
			.queryParam("busNo", busNo)
			.queryParam("CID", cityId)
			.encode(StandardCharsets.UTF_8).build().toUri();
		return Objects.requireNonNull(restTemplate.getForObject(uri, SearchBusLaneResult.class));
	}

	/** 노선 정류장 목록: laneId 필수 */
	public BusLaneStationResult busLaneStations(long laneId) {
		URI uri = UriComponentsBuilder
			.fromHttpUrl("https://api.odsay.com/v1/api/busLaneStation")
			.queryParam("apiKey", apiKey)
			.queryParam("busID", laneId)
			.encode(StandardCharsets.UTF_8).build().toUri();
		return Objects.requireNonNull(restTemplate.getForObject(uri, BusLaneStationResult.class));
	}

	/** 정류장 실시간 도착: stationId + CID */
	public RealtimeStationResult realtimeForStation(long stationId, int cityId) {
		URI uri = UriComponentsBuilder
			.fromHttpUrl("https://api.odsay.com/v1/api/realtimeStation")
			.queryParam("apiKey", apiKey)
			.queryParam("CID", cityId)
			.queryParam("stationID", stationId)
			.encode(StandardCharsets.UTF_8).build().toUri();
		return Objects.requireNonNull(restTemplate.getForObject(uri, RealtimeStationResult.class));
	}

	@Data @JsonIgnoreProperties(ignoreUnknown = true)
	public static class SearchBusLaneResult {
		private Result result;

		@Data @JsonIgnoreProperties(ignoreUnknown = true)
		public static class Result {
			private List<Lane> lane;

			@Data @JsonIgnoreProperties(ignoreUnknown = true)
			public static class Lane {
				@JsonProperty("busID")
				private long busId;       // = laneId
				private String busNo;     // "140"
				private int CID;          // 도시코드
			}
		}
	}

	@Data @JsonIgnoreProperties(ignoreUnknown = true)
	public static class BusLaneStationResult {
		private Result result;

		@Data @JsonIgnoreProperties(ignoreUnknown = true)
		public static class Result {
			private List<Station> station;

			@Data @JsonIgnoreProperties(ignoreUnknown = true)
			public static class Station {
				@JsonProperty("stationID")
				private long stationId;
				@JsonProperty("stationName")
				private String name;
				@JsonProperty("x")
				private double lng;
				@JsonProperty("y")
				private double lat;
				private int index; // 진행순서
			}
		}
	}

	@Data @JsonIgnoreProperties(ignoreUnknown = true)
	public static class RealtimeStationResult {
		private Result result;

		@Data @JsonIgnoreProperties(ignoreUnknown = true)
		public static class Result {
			private List<Arrival> realtimeArrivalList;

			@Data @JsonIgnoreProperties(ignoreUnknown = true)
			public static class Arrival {
				/** 노선 ID(=busID/laneId) */
				@JsonProperty("busID")
				private long busId;
				/** 남은 도착 분 */
				@JsonProperty("arrivalSec")
				private Integer arrivalSec; // 일부 응답은 sec, 일부는 min 존재 ⇒ sec 기준 사용
				@JsonProperty("arrivalTime")
				private Integer arrivalTimeMin; // 분 단위가 오면 여기
			}
		}
	}
}

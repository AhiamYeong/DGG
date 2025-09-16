package S13P21A305.dgg.global.external.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverGeocodeResponseDTO {
	private List<Address> addresses;

	@Getter
	@Setter
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Address {
		private String x; // 경도
		private String y; // 위도
	}
}
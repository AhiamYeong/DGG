package S13P21A305.dgg.route.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteRequestDTO {
	private String departureAddress;
	private String destinationAddress;
	private List<String> stopoverAddresses;
	private String startTime;
}

package S13P21A305.dgg.route.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RouteResponseDTO {
	private String departureAddress;
	private String destinationAddress;
	private List<String> stopoverAddresses;
	private String departureTime;
	private String destinationTime;
	private List<RecommendedRouteDTO>  recommendedRoutes;
}

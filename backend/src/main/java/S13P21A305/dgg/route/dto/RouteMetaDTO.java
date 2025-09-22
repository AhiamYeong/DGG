package S13P21A305.dgg.route.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteMetaDTO {
	private String departure;
	private String destination;
	private List<String> stopovers;
	private String departureTime;
	private String option;
}

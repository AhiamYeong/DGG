package S13P21A305.dgg.bookmark.dto;

import java.util.List;

import S13P21A305.dgg.route.dto.RouteDetailDTO;
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
public class BookmarkRouteDetailDTO {
	private Long bookmarkRouteId;
	private String name; // 즐겨찾기 명
	private Integer totalTime;
	private String arrivalTime;
	private List<RouteDetailDTO.Leg> data;
}

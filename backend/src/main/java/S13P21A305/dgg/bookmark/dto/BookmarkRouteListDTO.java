package S13P21A305.dgg.bookmark.dto;

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
public class BookmarkRouteListDTO {
	private Long bookmarkRouteId;
	private String name;
	private String departureName;
	private String destinationName;
	private String createdAt;
}

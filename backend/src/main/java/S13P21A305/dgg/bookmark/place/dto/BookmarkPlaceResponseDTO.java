package S13P21A305.dgg.bookmark.place.dto;

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
public class BookmarkPlaceResponseDTO {
	private Long bookmarkPlaceId;
	private String placeName;
	private String address;
}

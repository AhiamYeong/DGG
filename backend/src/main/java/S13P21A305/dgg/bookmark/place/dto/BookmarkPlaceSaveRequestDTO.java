package S13P21A305.dgg.bookmark.place.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookmarkPlaceSaveRequestDTO {
	private String placeName; // 장소 별칭
	private String address; // 검색 주소
	private double latitude;
	private double longitude;
}

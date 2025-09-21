package S13P21A305.dgg.bookmark.place.service;

import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceSaveRequestDTO;

public interface BookmarkPlaceService {
	Long savePlace(Integer memberId, BookmarkPlaceSaveRequestDTO req); // 장소 추가
}

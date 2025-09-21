package S13P21A305.dgg.bookmark.place.service;

import java.util.List;

import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceRenameRequestDTO;
import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceResponseDTO;
import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceSaveRequestDTO;

public interface BookmarkPlaceService {
	Long savePlace(Integer memberId, BookmarkPlaceSaveRequestDTO req); // 장소 추가
	List<BookmarkPlaceResponseDTO> getBookmarkList(Integer memberId); // 장소 목록 조회
	BookmarkPlaceResponseDTO renamePlace(Long placeId, Integer memberId, BookmarkPlaceRenameRequestDTO req); // 장소 이름 수정
}

package S13P21A305.dgg.bookmark.service;

import java.util.List;

import S13P21A305.dgg.bookmark.dto.BookmarkRouteDetailDTO;
import S13P21A305.dgg.bookmark.dto.BookmarkRouteListDTO;
import S13P21A305.dgg.bookmark.dto.BookmarkRouteSaveRequestDTO;

public interface BookmarkService {
	Long saveRouteBookmark(Integer memberId, BookmarkRouteSaveRequestDTO req); // 즐겨찾기 추가
	BookmarkRouteDetailDTO getBookmarkDetail(Long bookmarkRouteId, Integer memberId, boolean realtime, String departAt); // 즐겨찾기 상세조회
	List<BookmarkRouteListDTO> getBookmarkList(Integer memberId); // 경로 즐겨찾기 목록 조회
	void renameBookmark(Long bookmarkRouteId, Integer memberId, String newName); // 경로 즐겨찾기 이름 수정
}

package S13P21A305.dgg.bookmark.service;

import S13P21A305.dgg.bookmark.dto.BookmarkRouteSaveRequestDTO;

public interface BookmarkService {
	Long saveRouteBookmark(Integer memberId, BookmarkRouteSaveRequestDTO req);
}

package S13P21A305.dgg.bookmark.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import S13P21A305.dgg.bookmark.entity.BookmarkRouteInfo;
import S13P21A305.dgg.bookmark.entity.BookmarkRouteInfoId;

@Repository
public interface BookmarkRouteInfoRepository extends JpaRepository<BookmarkRouteInfo, BookmarkRouteInfoId> {
	List<BookmarkRouteInfo> findAllByBookmarkIdOrderByOrder(Long bookmarkRouteId);
}

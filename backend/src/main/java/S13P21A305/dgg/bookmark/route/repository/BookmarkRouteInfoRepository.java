package S13P21A305.dgg.bookmark.route.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import S13P21A305.dgg.bookmark.route.entity.BookmarkRouteInfo;
import S13P21A305.dgg.bookmark.route.entity.BookmarkRouteInfoId;

@Repository
public interface BookmarkRouteInfoRepository extends JpaRepository<BookmarkRouteInfo, BookmarkRouteInfoId> {
	List<BookmarkRouteInfo> findAllByBookmarkIdOrderByOrder(Long bookmarkRouteId);
}

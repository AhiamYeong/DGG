package S13P21A305.dgg.bookmark.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import S13P21A305.dgg.bookmark.entity.BookmarkRouteInfo;
import S13P21A305.dgg.bookmark.entity.BookmarkRouteInfoId;

public interface BookmarkRouteInfoRepository extends JpaRepository<BookmarkRouteInfo, BookmarkRouteInfoId> {
}

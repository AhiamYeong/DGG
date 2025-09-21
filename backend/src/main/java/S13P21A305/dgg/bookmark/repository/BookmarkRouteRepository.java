package S13P21A305.dgg.bookmark.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import S13P21A305.dgg.bookmark.entity.BookmarkRoute;

public interface BookmarkRouteRepository extends JpaRepository<BookmarkRoute, Long> {
	List<BookmarkRoute> findAllByMember_IdOrderById(Integer memberId); // 특정 회원의 즐겨찾기 목록 전체 조회
}

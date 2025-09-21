package S13P21A305.dgg.bookmark.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import S13P21A305.dgg.bookmark.entity.BookmarkRoute;
import jakarta.transaction.Transactional;

public interface BookmarkRouteRepository extends JpaRepository<BookmarkRoute, Long> {
	List<BookmarkRoute> findAllByMember_IdOrderById(Integer memberId); // 특정 회원의 즐겨찾기 목록 전체 조회

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Transactional
	long deleteByIdAndMember_Id(Long id, Integer memberId); // 특정 경로 즐겨찾기 삭제 - memberId의 즐겨찾기 id 삭제
}

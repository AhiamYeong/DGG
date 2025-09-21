package S13P21A305.dgg.bookmark.place.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import S13P21A305.dgg.bookmark.place.entity.BookmarkPlace;

public interface BookmarkPlaceRepository extends JpaRepository<BookmarkPlace, Long> {
	List<BookmarkPlace> findAllByMember_IdOrderById(Integer memberId); // 장소 조회
	Optional<BookmarkPlace> findByIdAndMember_Id(Long placeId, Integer memberId);
	long deleteByIdAndMember_Id(Long placeId, Integer memberId);
}

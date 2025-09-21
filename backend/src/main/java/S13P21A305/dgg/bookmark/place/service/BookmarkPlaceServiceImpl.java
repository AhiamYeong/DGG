package S13P21A305.dgg.bookmark.place.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceSaveRequestDTO;
import S13P21A305.dgg.bookmark.place.entity.BookmarkPlace;
import S13P21A305.dgg.bookmark.place.repository.BookmarkPlaceRepository;
import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookmarkPlaceServiceImpl implements BookmarkPlaceService {

	private final BookmarkPlaceRepository placeRepo;
	private final MemberRepository memberRepo;

	@Override
	@Transactional
	public Long savePlace(Integer memberId, BookmarkPlaceSaveRequestDTO req) {
		if (req.getPlaceName() == null || req.getPlaceName().isBlank()) {
			throw new IllegalArgumentException("장소 이름을 적어주세요.");
		}

		if (req.getAddress() == null || req.getAddress().isBlank()
		|| req.getLatitude() == null || req.getLongitude() == null) {
			throw new IllegalArgumentException("장소, 위도, 경도 입력은 필수입니다.");
		}

		Member member = memberRepo.findById(memberId)
			.orElseThrow(() -> new IllegalStateException("없는 회원 입니다."));

		BookmarkPlace p = BookmarkPlace.builder()
			.member(member)
			.placeName(req.getPlaceName())
			.address(req.getAddress())
			.latitude(req.getLatitude())
			.longitude(req.getLongitude())
			.build();

		placeRepo.save(p);

		return p.getId();
	}
}

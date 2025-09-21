package S13P21A305.dgg.bookmark.place.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceRenameRequestDTO;
import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceResponseDTO;
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

	@Override
	@Transactional(readOnly = true)
	public List<BookmarkPlaceResponseDTO> getBookmarkList(Integer memberId) {
		return placeRepo.findAllByMember_IdOrderById(memberId).stream().map(this::toDto).toList();
	}

	@Override
	@Transactional
	public BookmarkPlaceResponseDTO renamePlace(Long placeId, Integer memberId, BookmarkPlaceRenameRequestDTO req) {
		if (req.getPlaceName() == null || req.getPlaceName().isBlank()) {
			throw new IllegalArgumentException("새 별칭을 입력하세요.");
		}

		BookmarkPlace p = placeRepo.findByIdAndMember_Id(placeId, memberId)
			.orElseThrow(() -> new SecurityException("대상이 없거나 권한이 없습니다."));

		p.setPlaceName(req.getPlaceName());

		return toDto(p);
	}

	@Override
	@Transactional
	public void deletePlace(Long placeId, Integer memberId) {
		long deleted = placeRepo.deleteByIdAndMember_Id(placeId, memberId);

		if (deleted != 1) {
			throw new SecurityException("대상이 없거나 권한이 없습니다.");
		}
	}

	private BookmarkPlaceResponseDTO toDto(BookmarkPlace p) {
		return BookmarkPlaceResponseDTO.builder()
			.bookmarkPlaceId(p.getId())
			.placeName(p.getPlaceName())
			.address(p.getAddress())
			.latitude(p.getLatitude())
			.longitude(p.getLongitude())
			.build();
	}
}

package S13P21A305.dgg.bookmark.place.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceRenameRequestDTO;
import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceResponseDTO;
import S13P21A305.dgg.bookmark.place.dto.BookmarkPlaceSaveRequestDTO;
import S13P21A305.dgg.bookmark.place.service.BookmarkPlaceService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bookmarks/places")
public class BookmarkPlaceController {

	private final BookmarkPlaceService service;

	record IdOnly(Long bookmarkPlaceId) {} // 단순 id 응답시 사용

	// 장소 추가
	@PostMapping
	public ResponseEntity<IdOnly> save(
		@AuthenticationPrincipal CustomOAuth2User member,
		@RequestBody BookmarkPlaceSaveRequestDTO req
	) {
		Long id = service.savePlace(member.getMemberId(), req);

		return ResponseEntity.ok(new IdOnly(id));
	}

	// 즐겨찾는 장소 목록 조회
	@GetMapping
	public ResponseEntity<List<BookmarkPlaceResponseDTO>> getList(
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		return ResponseEntity.ok(service.getBookmarkList(member.getMemberId()));
	}

	// 장소 이름 수정
	@PutMapping("/{placeId}")
	public ResponseEntity<BookmarkPlaceResponseDTO> rename(
		@PathVariable Long placeId,
		@AuthenticationPrincipal CustomOAuth2User member,
		@RequestBody BookmarkPlaceRenameRequestDTO req
	) {
		return ResponseEntity.ok(service.renamePlace(placeId, member.getMemberId(), req));
	}

	// 장소 즐겨찾기 목록에서 특정 장소 삭제
	@DeleteMapping("/{placeId}")
	public ResponseEntity<Void> delete(
		@PathVariable Long placeId,
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		service.deletePlace(placeId, member.getMemberId());

		return  ResponseEntity.noContent().build();
	}
}

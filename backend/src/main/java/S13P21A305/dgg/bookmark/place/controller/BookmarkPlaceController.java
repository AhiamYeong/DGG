package S13P21A305.dgg.bookmark.place.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
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

	private Integer resolveMemberId(CustomOAuth2User member, Integer header) {
		return member != null ? member.getMemberId() : header;
	}

	// 장소 추가
	@PostMapping
	public ResponseEntity<IdOnly> save(
		@AuthenticationPrincipal CustomOAuth2User member,
		@RequestHeader(name = "X-DGG-MEMBER-ID", required = false) Integer memberIdHeader,
		@RequestBody BookmarkPlaceSaveRequestDTO req
	) {
		Integer memberId = resolveMemberId(member, memberIdHeader);
		Long id = service.savePlace(memberId, req);

		return ResponseEntity.ok(new IdOnly(id));
	}

	// 즐겨찾는 장소 목록 조회
	@GetMapping
	public ResponseEntity<List<BookmarkPlaceResponseDTO>> getList(
		@AuthenticationPrincipal CustomOAuth2User member,
		@RequestHeader(name = "X-DGG-MEMBER-ID", required = false) Integer memberIdHeader
	) {
		Integer memberId = resolveMemberId(member, memberIdHeader);

		return ResponseEntity.ok(service.getBookmarkList(memberId));
	}
}

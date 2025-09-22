package S13P21A305.dgg.bookmark.route.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.bookmark.route.dto.BookmarkRouteDetailDTO;
import S13P21A305.dgg.bookmark.route.dto.BookmarkRouteListDTO;
import S13P21A305.dgg.bookmark.route.dto.BookmarkRouteRenameRequestDTO;
import S13P21A305.dgg.bookmark.route.dto.BookmarkRouteSaveRequestDTO;
import S13P21A305.dgg.bookmark.route.service.BookmarkService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bookmarks/routes")
@RequiredArgsConstructor
public class BookmarkController {

	private final BookmarkService bookmarkService;

	// 즐겨찾기 추가
	@PostMapping
	public ResponseEntity<Map<String, Long>> save(
		@RequestBody BookmarkRouteSaveRequestDTO req,
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		Long bookmarkId = bookmarkService.saveRouteBookmark(member.getMemberId(), req);

		return ResponseEntity.ok(Map.of("bookmarkId", bookmarkId));
	}

	// 즐겨찾기 목록 조회
	@GetMapping
	public ResponseEntity<List<BookmarkRouteListDTO>> getList(
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		return ResponseEntity.ok(bookmarkService.getBookmarkList(member.getMemberId()));
	}

	// 즐겨찾기에 등록된 경로에 대한 상세조회
	@GetMapping("/{bookmarkRouteId}")
	public ResponseEntity<BookmarkRouteDetailDTO> getDetail(
		@PathVariable Long bookmarkRouteId,
		@RequestParam(name = "realtime", defaultValue = "false") boolean realtime,
		@RequestParam(name = "departAt", required = false) String departAt,
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		BookmarkRouteDetailDTO dto = bookmarkService.getBookmarkDetail(bookmarkRouteId, member.getMemberId(), realtime, departAt);

		return ResponseEntity.ok(dto);
	}

	// 경로 즐겨찾기 이름 수정
	@PutMapping("/{bookmarkRouteId}")
	public ResponseEntity<BookmarkRouteDetailDTO> rename(
		@PathVariable Long bookmarkRouteId,
		@RequestBody BookmarkRouteRenameRequestDTO req,
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		bookmarkService.renameBookmark(bookmarkRouteId, member.getMemberId(), req.getName());

		return ResponseEntity.noContent().build();
	}

	// 경로 즐겨찾기에서 특정 경로 삭제 - soft delete 적용X
	@DeleteMapping("/{bookmarkRouteId}")
	public ResponseEntity<Void> delete(
		@PathVariable Long bookmarkRouteId,
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		bookmarkService.deleteBookmark(bookmarkRouteId, member.getMemberId());

		return ResponseEntity.noContent().build();
	}
}

package S13P21A305.dgg.bookmark.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.bookmark.dto.BookmarkRouteSaveRequestDTO;
import S13P21A305.dgg.bookmark.service.BookmarkService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

	private final BookmarkService bookmarkService;

	@PostMapping("/routes")
	public ResponseEntity<Map<String, Long>> save(
		@RequestBody BookmarkRouteSaveRequestDTO req,
		@AuthenticationPrincipal CustomOAuth2User member,
		@RequestHeader(name="X-DGG-MEMBER-ID", required=false) Integer memberIdHeader
	) {
		Integer memberId = (member != null) ? member.getMemberId() : memberIdHeader;
		if (memberId == null) return ResponseEntity.status(401).build();

		Long bookmarkId = bookmarkService.saveRouteBookmark(memberId, req);

		return ResponseEntity.ok(Map.of("bookmarkId", bookmarkId));
	}
}

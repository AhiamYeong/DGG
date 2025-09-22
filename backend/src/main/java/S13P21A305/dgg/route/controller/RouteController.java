package S13P21A305.dgg.route.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import S13P21A305.dgg.auth.dto.CustomOAuth2User;
import S13P21A305.dgg.route.dto.RouteDetailDTO;
import S13P21A305.dgg.route.dto.RouteRequestDTO;
import S13P21A305.dgg.route.dto.RouteResponseDTO;
import S13P21A305.dgg.route.service.RouteService;

@RestController
@RequestMapping("/api/v1/maps/routes")
public class RouteController {

	private final RouteService routeService;

	public RouteController(RouteService routeService) {
		this.routeService = routeService;
	}

	/** 길찾기 실행 (요약 3개 + redis 저장) */
	@PostMapping
	public ResponseEntity<RouteResponseDTO> findRoute(@RequestBody RouteRequestDTO routeRequestDTO) {
		return ResponseEntity.ok(routeService.findRoute(routeRequestDTO));
	}

	/** 길안내 시작 (캐시 키 -> DB에 저장)
	 *  {routeKey} = 캐시 키
	 */
	@PostMapping("/{routeKey}/start")
	public ResponseEntity<Long> start(
		@PathVariable String routeKey,
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		if (member == null) return ResponseEntity.status(401).build();

		return ResponseEntity.ok(routeService.startNavigation(routeKey, member.getMemberId()).getId());
	}

	/** 선택한 경로에 대한 상세 경로 조회 (DB) */
	@GetMapping("/{routeId}")
	public ResponseEntity<RouteDetailDTO> getDetail(
		@PathVariable Long routeId,
		@AuthenticationPrincipal CustomOAuth2User member
	) {
		Integer memberId = member == null ? null : member.getMemberId();

		return ResponseEntity.ok(routeService.getDetail(routeId, memberId));
	}
}

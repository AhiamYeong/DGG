package S13P21A305.dgg.route.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import S13P21A305.dgg.route.dto.RouteRequestDTO;
import S13P21A305.dgg.route.dto.RouteResponseDTO;
import S13P21A305.dgg.route.service.RouteService;

@RestController
@RequestMapping("/api/v1/maps")
public class RouteController {

	private final RouteService routeService;

	public RouteController(RouteService routeService) {
		this.routeService = routeService;
	}

	@PostMapping("/routes")
	public ResponseEntity<RouteResponseDTO> findRoute(@RequestBody RouteRequestDTO routeRequestDTO) {
		RouteResponseDTO result = routeService.findRoute(routeRequestDTO);

		return ResponseEntity.ok(result);
	}
}

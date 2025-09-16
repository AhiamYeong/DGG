package S13P21A305.dgg.common.controller;

import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.global.external.service.GeocodingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// 임시

@RestController
@RequestMapping("/api/v1/test")
public class GeocodingTestController {

	private final GeocodingService geocodingService;

	public GeocodingTestController(GeocodingService geocodingService) {
		this.geocodingService = geocodingService;
	}

	@GetMapping("/geocode")
	public ResponseEntity<Point> testGeocoding(@RequestParam String address) {
		Point coordinates = geocodingService.getCoordinates(address);
		return ResponseEntity.ok(coordinates);
	}
}
package S13P21A305.dgg.search.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.global.external.service.GeocodingService;
import S13P21A305.dgg.search.dto.NaverSearchResponseDTO;
import S13P21A305.dgg.search.service.SearchService;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

	private final SearchService searchService;
	private final GeocodingService geocodingService;

	public SearchController(SearchService searchService, GeocodingService geocodingService) {
		this.searchService = searchService;
		this.geocodingService = geocodingService;
	}

	@GetMapping("/places")
	public ResponseEntity<NaverSearchResponseDTO> searchPlaces(@RequestParam String query) {
		NaverSearchResponseDTO searchResult = searchService.searchPlaceByKeyword(query);
		return ResponseEntity.ok(searchResult);
	}

	@GetMapping("/geocode")
	public ResponseEntity<Point> geocodeTest(@RequestParam String address) {
		Point coordinates = geocodingService.getCoordinates(address);

		return ResponseEntity.ok(coordinates);
	}
}
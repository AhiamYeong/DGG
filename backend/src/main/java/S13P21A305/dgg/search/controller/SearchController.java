package S13P21A305.dgg.search.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import S13P21A305.dgg.search.dto.NaverSearchResponseDTO;
import S13P21A305.dgg.search.service.SearchService;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

	private final SearchService searchService;

	public SearchController(SearchService searchService) {
		this.searchService = searchService;
	}

	@GetMapping("/places")
	public ResponseEntity<NaverSearchResponseDTO> searchPlaces(@RequestParam String query) {
		NaverSearchResponseDTO searchResult = searchService.searchPlaceByKeyword(query);
		return ResponseEntity.ok(searchResult);
	}
}
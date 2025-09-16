package S13P21A305.dgg.search.service;

import S13P21A305.dgg.search.dto.NaverSearchResponseDTO;

public interface SearchService {
	NaverSearchResponseDTO searchPlaceByKeyword(String query);
}
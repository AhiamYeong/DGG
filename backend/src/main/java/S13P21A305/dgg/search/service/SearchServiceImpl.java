package S13P21A305.dgg.search.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import S13P21A305.dgg.search.dto.NaverSearchResponseDTO;

@Service
public class SearchServiceImpl implements SearchService {

	private final RestTemplate restTemplate;

	@Value("${naver.api.search.client-id}")
	private String naverClientId;

	@Value("${naver.api.search.client-secret}")
	private String naverClientSecret;

	public SearchServiceImpl(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	@Override
	public NaverSearchResponseDTO searchPlaceByKeyword(String query) {
		final String url = "https://openapi.naver.com/v1/search/local.json";

		URI uri = UriComponentsBuilder.fromHttpUrl(url)
			.queryParam("query", query)
			.queryParam("display", 10) // 검색 결과 10개로 보이기
			.encode(StandardCharsets.UTF_8).build().toUri();

		HttpHeaders headers = new HttpHeaders();
		headers.set("X-Naver-Client-Id", naverClientId);
		headers.set("X-Naver-Client-Secret", naverClientSecret);
		HttpEntity<String> entity = new HttpEntity<>(headers);

		ResponseEntity<NaverSearchResponseDTO> response = restTemplate.exchange(uri, HttpMethod.GET, entity, NaverSearchResponseDTO.class);

		return response.getBody();
	}
}
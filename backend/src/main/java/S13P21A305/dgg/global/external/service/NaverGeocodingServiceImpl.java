package S13P21A305.dgg.global.external.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import S13P21A305.dgg.common.dto.Point;
import S13P21A305.dgg.global.external.dto.NaverGeocodeResponseDTO;

@Service
public class NaverGeocodingServiceImpl implements GeocodingService {

	private final RestTemplate restTemplate;

	@Value("${naver.api.geocoding.client-id}")
	private String naverClientId;

	@Value("${naver.api.geocoding.client-secret}")
	private String naverClientSecret;

	public NaverGeocodingServiceImpl(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	@Override
	public Point getCoordinates(String address) {

		final String url = "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode";

		URI uri = UriComponentsBuilder.fromHttpUrl(url)
			.queryParam("query", address)
			.queryParam("coordinate", "WGS84")
			.encode(StandardCharsets.UTF_8).build().toUri();

		HttpHeaders headers = new HttpHeaders();
		headers.set("X-NCP-APIGW-API-KEY-ID", naverClientId);
		headers.set("X-NCP-APIGW-API-KEY", naverClientSecret);
		HttpEntity<String> entity = new HttpEntity<>(headers);

		ResponseEntity<NaverGeocodeResponseDTO> response = restTemplate.exchange(uri, HttpMethod.GET, entity, NaverGeocodeResponseDTO.class);
		NaverGeocodeResponseDTO body = response.getBody();

		if (body != null && body.getAddresses() != null && !body.getAddresses().isEmpty()) {
			NaverGeocodeResponseDTO.Address firstAddress = body.getAddresses().get(0);

			return new Point(firstAddress.getX(), firstAddress.getY());
		}

		throw new RuntimeException("주소에 해당하는 좌표를 찾을 수 없습니다: " + address);
	}
}

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

import S13P21A305.dgg.global.external.dto.NaverGeocodeResponseDTO.Address;

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

		final String url = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";

		URI uri = UriComponentsBuilder.fromHttpUrl(url)
			.queryParam("query", address)
			.encode(StandardCharsets.UTF_8)
			.build()
			.toUri();

		HttpHeaders headers = new HttpHeaders();
		headers.set("X-NCP-APIGW-API-KEY-ID", naverClientId);
		headers.set("X-NCP-APIGW-API-KEY", naverClientSecret);

		HttpEntity<String> entity = new HttpEntity<>(headers);

		ResponseEntity<NaverGeocodeResponseDTO> response =
			restTemplate.exchange(uri, HttpMethod.GET, entity, NaverGeocodeResponseDTO.class);

		NaverGeocodeResponseDTO body = response.getBody();
		if (body == null || body.getAddresses() == null || body.getAddresses().isEmpty()) {
			throw new IllegalStateException("주소에 해당하는 좌표를 찾을 수 없습니다: " + address);
		}

		Address a = body.getAddresses().get(0);
		try {
			double lon = Double.parseDouble(a.getX()); // x=경도
			double lat = Double.parseDouble(a.getY()); // y=위도

			return Point.of(lat, lon);
		} catch (NumberFormatException nfe) {
			throw new IllegalStateException("지오코딩 응답 좌표 파싱 실패: " + a.getX() + "," + a.getY(), nfe);
		}
	}
}

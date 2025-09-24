package S13P21A305.dgg.waypoint.util;

import S13P21A305.dgg.waypoint.dto.ODsayPointStationResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Slf4j
@Component
public class ODsayClient {
    private final WebClient webClient;
    private final String baseUrl;

    private final ObjectMapper om = new ObjectMapper();

    @Value("${odsay.api.key}")
    private final String apiKey;

    public ODsayClient(
            WebClient webClient,
            @Value("https://api.odsay.com/v1/api") String baseUrl,
            @Value("${odsay.api.key}") String apiKey
    ){
        this.webClient = webClient.mutate().baseUrl(baseUrl).build();
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    /**
     * odsay에서 가져오는 값
     */
    // x, y 기반으로 r 떨어진 곳의 정류장들 리스트로 받아오기
    public Mono<ODsayPointStationResponse> getNearby(double lat, double lon, int radiusMeters) {
        return webClient.get()
                .uri(uri -> uri.path("/pointBusStation")
                    .queryParam("x", lon)
                    .queryParam("y", lat)
                    .queryParam("radius", radiusMeters)
                    .queryParam("apiKey", apiKey)
                    .build())
                .exchangeToMono(res -> {
                    HttpStatusCode status = res.statusCode();
                    // 헤더도 보고 싶으면: res.headers().asHttpHeaders()
                    if (status.is2xxSuccessful()) {
                        // 2xx라도 파싱 전에 원문 바디를 찍어 확인
                        return res.bodyToMono(String.class)
                                .doOnNext(body -> log.debug("[ODsay 2xx] body={}", body))
                                .flatMap(body -> {
                                    try {
                                        var dto = om.readValue(body, ODsayPointStationResponse.class);
                                        return Mono.just(dto);
                                    } catch (Exception e) {
                                        log.error("ODsay JSON parse fail", e);
                                        return Mono.error(new RuntimeException("ODsay JSON parse fail: " + e.getMessage()));
                                    }
                                });
                    } else {
                        // 에러 바디 로깅
                        return res.bodyToMono(String.class)
                                .defaultIfEmpty("")
                                .flatMap(body -> {
                                    log.warn("[ODsay {}] body={}", status.value(), body);
                                    return Mono.error(new RuntimeException("ODsay error " + status.value() + ": " + body));
                                });
                    }
                });
    }


    //raw data
    public Mono<Map<String, Object>> getNearbyRaw(double lat, double lon, int radiusMeters) {
        return webClient.get()
                .uri(uri -> uri.path("/pointBusStation")
                        .queryParam("x", lon)   // ODsay는 x=경도, y=위도
                        .queryParam("y", lat)
                        .queryParam("radius", radiusMeters)
                        .queryParam("apiKey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }
}

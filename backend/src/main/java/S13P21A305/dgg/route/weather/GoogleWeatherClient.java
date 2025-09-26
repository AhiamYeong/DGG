package S13P21A305.dgg.route.weather;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleWeatherClient implements WeatherPort {

    private final RestTemplate restTemplate;

    @Value("${weather.google.base-url}")
    private String baseUrl;

    @Value("${weather.google.api-key}")
    private String apiKey;

    @Override
    public WeatherInfo current(double latitude, double longitude) {
        var uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("key", apiKey)
                .queryParam("location.latitude", latitude)
                .queryParam("location.longitude", longitude)
                .queryParam("languageCode", "ko") // 한국어 설명 시도
                .build(true).toUri();

        try {
            log.info("[GWeather] GET {}", uri);
            var resp = restTemplate.getForEntity(uri, GoogleResp.class);
            log.info("[GWeather] status={} {}", resp.getStatusCodeValue(), resp.getStatusCode());
            var body = resp.getBody();
            if (body == null) {
                log.warn("[GWeather] empty body");
                return fallback();
            }
            String type = body.weatherCondition != null ? safe(body.weatherCondition.type) : "";
            String desc = (body.weatherCondition != null && body.weatherCondition.description != null)
                    ? safe(body.weatherCondition.description.text)
                    : localDescFromType(type);

            Double temp  = sanitize(body.temperature != null ? body.temperature.degrees : null);
            Double feels = sanitize(body.feelsLikeTemperature != null ? body.feelsLikeTemperature.degrees : temp);

            var status = mapStatus(type);
            if (desc.isBlank() || isEnglish(desc)) desc = localDescFromStatus(status);

            return new WeatherInfo(status, desc, temp, feels);

        } catch (RestClientException e) {
            log.warn("[GWeather] call failed: {}", e.getMessage());
            return fallback();
        }
    }

    private static Double sanitize(Double v) { return (v == null || v.isNaN() || v.isInfinite()) ? null : v; }

    private static String safe(String s){ return s==null? "": s; }
    private static boolean isEnglish(String s){ return s.matches("^[ -~]+$"); }

    private WeatherInfo fallback() {
        return new WeatherInfo(WeatherStatus.UNKNOWN, "날씨 정보를 가져오지 못했어요", null, null);
    }

    private WeatherStatus mapStatus(String googleType) {
        if (googleType == null) return WeatherStatus.UNKNOWN;
        String t = googleType.toUpperCase();

        // 맑음/구름
        if (t.equals("CLEAR") || t.equals("MOSTLY_CLEAR")) return WeatherStatus.SUNNY;
        if (t.equals("PARTLY_CLOUDY") || t.equals("MOSTLY_CLOUDY") || t.equals("CLOUDY")) return WeatherStatus.CLOUDY;

        // 비
        if (t.contains("RAIN")) return WeatherStatus.RAINY;
        if (t.contains("SHOWERS") && !t.contains("SNOW")) return WeatherStatus.RAINY;

        // 눈
        if (t.contains("SNOW") && !t.contains("RAIN")) return WeatherStatus.SNOWY;

        // 비+눈
        if (t.equals("RAIN_AND_SNOW")) return WeatherStatus.MIXED;

        // 우박
        if (t.contains("HAIL")) return WeatherStatus.HAIL;

        // 바람
        if (t.equals("WINDY") || t.equals("WIND_AND_RAIN")) return WeatherStatus.WINDY;

        // 천둥/뇌우
        if (t.contains("THUNDER")) return WeatherStatus.THUNDERSTORM;

        return WeatherStatus.UNKNOWN;
    }

    private String localDescFromType(String t) {
        return localDescFromStatus(mapStatus(t));
    }

    private String localDescFromStatus(WeatherStatus s) {
        return switch (s) {
            case SUNNY -> "오늘은 맑아요";
            case CLOUDY -> "구름이 많아요";
            case RAINY -> "비가 내려요";
            case SNOWY -> "눈이 와요";
            case WINDY -> "바람이 강해요";
            case THUNDERSTORM -> "천둥번개를 동반한 비가 와요";
            case HAIL -> "우박이 내려요";
            case MIXED -> "진눈깨비가 내려요";
            default -> "날씨 정보를 확인 중이에요";
        };
    }

    // ====== 최소 매핑용 DTO ======
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class GoogleResp {
        public WeatherCondition weatherCondition;
        public Temperature temperature;
        public Temperature feelsLikeTemperature;

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class WeatherCondition {
            public String type; // e.g., CLEAR, LIGHT_RAIN, ...
            public Desc description;
        }
        @JsonIgnoreProperties(ignoreUnknown = true)
        static class Desc { public String text; public String languageCode; }
        @JsonIgnoreProperties(ignoreUnknown = true)
        static class Temperature { public Double degrees; public String unit; }
    }
}

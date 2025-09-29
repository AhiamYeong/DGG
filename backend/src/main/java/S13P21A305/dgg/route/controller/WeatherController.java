package S13P21A305.dgg.route.controller;

import S13P21A305.dgg.route.weather.WeatherInfo;
import S13P21A305.dgg.route.weather.WeatherPort;
import S13P21A305.dgg.route.weather.WeatherStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/weather")
public class WeatherController {

    private final WeatherPort weatherPort;

    // GET /api/v1/weather?latitude=37.4220&longitude=-122.0841
    @GetMapping
    public WeatherEnvelope get(@RequestParam double latitude, @RequestParam double longitude) {
        log.info("[Weather] GET lat={}, lon={}", latitude, longitude);
        WeatherInfo w = weatherPort.current(latitude, longitude);
        log.info("[Weather] result status={}, tempC={}, feelsC={}",
                w.status(), w.temperatureC(), w.feelsLikeC());
        return WeatherEnvelope.from(w);
    }

    // (옵션) POST로 본문 받기 지원
    @PostMapping
    public WeatherEnvelope post(@RequestBody WeatherReq req) {
        WeatherInfo w = weatherPort.current(req.latitude, req.longitude);
        return WeatherEnvelope.from(w);
    }

    // ===== DTOs =====
    @Data
    public static class WeatherReq {
        private double latitude;
        private double longitude;
    }

    @Data @AllArgsConstructor
    public static class WeatherEnvelope {
        private WeatherBody weather;

        public static WeatherEnvelope from(WeatherInfo w) {
            return new WeatherEnvelope(new WeatherBody(
                    mapStatusName(w.status()),
                    w.description(),
                    w.temperatureC()
            ));
        }
    }

    @Data @AllArgsConstructor
    public static class WeatherBody {
        private String status;      // "SUNNY" 등 문자열 (프론트 요구 포맷)
        private String description; // "오늘은 맑아요"
        private Double temperature; // °C
    }



    private static String mapStatusName(WeatherStatus s) {
        return s==null? "UNKNOWN" : s.name();
    }
}

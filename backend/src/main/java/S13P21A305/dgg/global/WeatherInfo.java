package S13P21A305.dgg.global;

import S13P21A305.dgg.route.weather.WeatherStatus;

public record WeatherInfo(
        WeatherStatus status,    // SUNNY, RAINY, SNOWY, CLOUDY, WINDY, THUNDERSTORM, HAIL, MIXED, UNKNOWN
        String description,      // 한국어 간단 설명
        double temperatureC,     // 현재 기온(°C)
        double feelsLikeC        // 체감온도(°C)
) {}
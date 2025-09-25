package S13P21A305.dgg.route.weather;

public record WeatherInfo(
        WeatherStatus status,    // SUNNY, RAINY, SNOWY, CLOUDY, WINDY, THUNDERSTORM, HAIL, MIXED, UNKNOWN
        String description,      // 한국어 간단 설명
        Double temperatureC,     // 현재 기온(°C)
        Double feelsLikeC        // 체감온도(°C)
) {}

package S13P21A305.dgg.route.weather;

public interface WeatherPort {
    WeatherInfo current(double latitude, double longitude);
}


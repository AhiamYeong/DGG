package S13P21A305.dgg.common.dto;

public record Point(double lat, double lon) {
	public static Point of(double lat, double lon) {
		return new Point(lat, lon);
	}
}

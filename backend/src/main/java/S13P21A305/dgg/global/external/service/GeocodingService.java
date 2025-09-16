package S13P21A305.dgg.global.external.service;

import S13P21A305.dgg.common.dto.Point;

public interface GeocodingService {
	Point getCoordinates(String address);
}

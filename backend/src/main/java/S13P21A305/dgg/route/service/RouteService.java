package S13P21A305.dgg.route.service;

import S13P21A305.dgg.route.dto.RouteRequestDTO;
import S13P21A305.dgg.route.dto.RouteResponseDTO;

public interface RouteService {
	RouteResponseDTO findRoute(RouteRequestDTO routeRequestDTO);
}

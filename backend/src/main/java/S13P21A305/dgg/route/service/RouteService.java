package S13P21A305.dgg.route.service;

import java.util.List;

import S13P21A305.dgg.route.dto.RecommendedRouteDTO;
import S13P21A305.dgg.route.dto.RouteDetailDTO;
import S13P21A305.dgg.route.dto.RouteRequestDTO;
import S13P21A305.dgg.route.dto.RouteResponseDTO;
import S13P21A305.dgg.route.dto.StationCoordDTO;
import S13P21A305.dgg.route.entity.RouteLog;

public interface RouteService {
	RouteResponseDTO findRoute(RouteRequestDTO routeRequestDTO); // ODsay 호출 + 캐시 저장(요약)
	RecommendedRouteDTO getSummary(String routeKey);             // 캐시 요약 조회
	RouteDetailDTO getDetail(Long routeId, Integer memberId);    // DB 상세 조회
	RouteLog startNavigation(String routeKey, Integer memberId); // 캐시 -> DB 저장(길안내 시작)
	List<StationCoordDTO> getShortestStationsByCoords(double sx, double sy, double ex, double ey);
}

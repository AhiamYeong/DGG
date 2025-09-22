package S13P21A305.dgg.route.repository;

import S13P21A305.dgg.route.entity.RouteInfo;
import S13P21A305.dgg.route.entity.RouteInfoId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteInfoRepository extends JpaRepository<RouteInfo, RouteInfoId> {
	List<RouteInfo> findAllByRouteIdOrderByOrder(Long routeId);
}
package S13P21A305.dgg.route.service;

import S13P21A305.dgg.route.domain.Route;
import java.util.List;

public interface CongestionProvider {
    /** 각 Route.congestionRate(0~1) 주입 */
    void enrich(List<Route> routes);
}

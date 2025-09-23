package S13P21A305.dgg.route.service;

import S13P21A305.dgg.route.domain.Route;
import java.util.List;

public interface FatigueService {
    double calculateFatigue(Integer memberId, List<Route> routeList);
}

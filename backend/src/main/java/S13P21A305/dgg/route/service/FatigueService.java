package S13P21A305.dgg.route.service;

import S13P21A305.dgg.route.domain.Route;
import java.util.List;
import java.util.Map;

public interface FatigueService {
    double calculateFatigue(Integer memberId, List<Route> routeList);
    // FatigueService 인터페이스에 추가
    double calculateFatigueFromPayload(Integer memberId, List<Map<String, Object>> data);

}

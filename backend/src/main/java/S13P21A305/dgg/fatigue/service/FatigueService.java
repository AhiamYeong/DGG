package S13P21A305.dgg.fatigue.service;

import S13P21A305.dgg.fatigue.dto.request.FatigueUpdateRequest;
import S13P21A305.dgg.fatigue.dto.response.FatigueResponse;
import S13P21A305.dgg.fatigue.domain.FatigueLog;
import S13P21A305.dgg.route.domain.Route;
import S13P21A305.dgg.route.domain.RoutePayload;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface FatigueService {

    int currentFatigue(Integer memberId);

    FatigueResponse update(Integer memberId, FatigueUpdateRequest req);

    List<FatigueLog> todayHistory(Integer memberId);

    List<Record> weeklyFatigue(Integer memberId, LocalDate monday);
    double calculateFatigue(Integer memberId, List<Route> routeList);
    double calculateFatigueFromPayload(Integer memberId, List<RoutePayload> payload);

    // 주간 응답용 (mon~sun 키, 정수 값)
    record Record(String day, int value) {}
}

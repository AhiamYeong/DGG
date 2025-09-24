// src/main/java/.../route/service/CongestionProviderDb.java
package S13P21A305.dgg.route.service;

import S13P21A305.dgg.route.domain.Route;
import S13P21A305.dgg.route.domain.TransportType;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.ZonedDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CongestionProviderDb implements CongestionProvider {

    private final NamedParameterJdbcTemplate jdbc;
    private final Clock clock; // KST 주입

    @Override
    public void enrich(List<Route> routes) {
        if (routes == null || routes.isEmpty()) return;

        int slot = ZonedDateTime.now(clock).getHour(); // 0~23

        var busList    = routes.stream().filter(r -> r.getType()==TransportType.BUS).toList();
        var subwayList = routes.stream().filter(r -> r.getType()==TransportType.SUBWAY).toList();

        // BUS: 정확키(노선명+출발+도착+slot) → 노선명+slot → 노선명 일평균
        var busMapExact   = loadBusByRouteDepDestAtHour(busList, slot);
        var busMapRouteHr = loadBusByRouteAtHour(busList, slot);
        var busMapRoute   = loadBusByRouteDailyAvg(busList);

        // SUBWAY: 정확키(역+도착+slot) → 역+slot → 역 일평균
        var subMapExact = loadSubwayByStationDestAtHour(subwayList, slot);
        var subMapStatHr= loadSubwayByStationAtHour(subwayList, slot);
        var subMapStat  = loadSubwayByStationDailyAvg(subwayList);

        for (Route r : routes) {
            switch (r.getType()) {
                case BUS -> {
                    String k3 = key3(r.getLineName(), r.getStartPoint(), r.getEndPoint());
                    Double v = firstNonNull(
                            busMapExact.get(k3),
                            busMapRouteHr.get(nvl(r.getLineName())),
                            busMapRoute.get(nvl(r.getLineName()))
                    );
                    r.setCongestionRate(v);
                }
                case SUBWAY -> {
                    String k2 = key2(r.getStartPoint(), r.getEndPoint());
                    Double v = firstNonNull(
                            subMapExact.get(k2),
                            subMapStatHr.get(nvl(r.getStartPoint())),
                            subMapStat.get(nvl(r.getStartPoint()))
                    );
                    r.setCongestionRate(v);
                }
                case WALKING -> r.setCongestionRate(null); // 환승 보행은 미적용
            }
        }
    }

    // ================= BUS =================

    /** AVG(congestion_ratio) by (route_name, departure, destination) at hour */
    private Map<String, Double> loadBusByRouteDepDestAtHour(List<Route> routes, int slot) {
        var keys = routes.stream()
                .filter(r -> nz(r.getLineName()) && nz(r.getStartPoint()) && nz(r.getEndPoint()))
                .map(r -> key3(r.getLineName(), r.getStartPoint(), r.getEndPoint()))
                .distinct().toList();
        if (keys.isEmpty()) return Map.of();

        String sql = """
            SELECT CONCAT(route_name,'|',departure,'|',destination) AS k,
                   AVG(congestion_ratio) AS v
            FROM bus_congestion
            WHERE time_slot = :slot
              AND month = (SELECT MAX(month) FROM bus_congestion)  -- 최신월
              AND CONCAT(route_name,'|',departure,'|',destination) IN (:keys)
            GROUP BY 1
        """;
        return jdbc.query(sql, Map.of("slot", slot, "keys", keys), rs -> {
            Map<String, Double> m = new HashMap<>();
            while (rs.next()) m.put(rs.getString("k"), rs.getDouble("v"));
            return m;
        });
    }

    /** AVG(congestion_ratio) by route_name at hour (fallback 1) */
    private Map<String, Double> loadBusByRouteAtHour(List<Route> routes, int slot) {
        var names = routes.stream().map(Route::getLineName).filter(this::nz).distinct().toList();
        if (names.isEmpty()) return Map.of();

        String sql = """
            SELECT route_name AS k, AVG(congestion_ratio) AS v
            FROM bus_congestion
            WHERE time_slot = :slot
              AND month = (SELECT MAX(month) FROM bus_congestion)
              AND route_name IN (:names)
            GROUP BY route_name
        """;
        return jdbc.query(sql, Map.of("slot", slot, "names", names), rs -> {
            Map<String, Double> m = new HashMap<>();
            while (rs.next()) m.put(rs.getString("k"), rs.getDouble("v"));
            return m;
        });
    }

    /** AVG(congestion_ratio) by route_name (daily avg, fallback 2) */
    private Map<String, Double> loadBusByRouteDailyAvg(List<Route> routes) {
        var names = routes.stream().map(Route::getLineName).filter(this::nz).distinct().toList();
        if (names.isEmpty()) return Map.of();

        String sql = """
            SELECT route_name AS k, AVG(congestion_ratio) AS v
            FROM bus_congestion
            WHERE month = (SELECT MAX(month) FROM bus_congestion)
              AND route_name IN (:names)
            GROUP BY route_name
        """;
        return jdbc.query(sql, Map.of("names", names), rs -> {
            Map<String, Double> m = new HashMap<>();
            while (rs.next()) m.put(rs.getString("k"), rs.getDouble("v"));
            return m;
        });
    }

    // ================= SUBWAY =================

    /** AVG(congestion) by (station, destination) at hour */
    private Map<String, Double> loadSubwayByStationDestAtHour(List<Route> routes, int slot) {
        var keys = routes.stream()
                .filter(r -> nz(r.getStartPoint()) && nz(r.getEndPoint()))
                .map(r -> key2(r.getStartPoint(), r.getEndPoint()))
                .distinct().toList();
        if (keys.isEmpty()) return Map.of();

        String sql = """
            SELECT CONCAT(station,'|',destination) AS k,
                   AVG(congestion) AS v
            FROM subway_congestion
            WHERE time_slot = :slot
              AND CONCAT(station,'|',destination) IN (:keys)
            GROUP BY 1
        """;
        return jdbc.query(sql, Map.of("slot", slot, "keys", keys), rs -> {
            Map<String, Double> m = new HashMap<>();
            while (rs.next()) m.put(rs.getString("k"), rs.getDouble("v"));
            return m;
        });
    }

    /** AVG(congestion) by station at hour (fallback 1) */
    private Map<String, Double> loadSubwayByStationAtHour(List<Route> routes, int slot) {
        var stations = routes.stream().map(Route::getStartPoint).filter(this::nz).distinct().toList();
        if (stations.isEmpty()) return Map.of();

        String sql = """
            SELECT station AS k, AVG(congestion) AS v
            FROM subway_congestion
            WHERE time_slot = :slot
              AND station IN (:stations)
            GROUP BY station
        """;
        return jdbc.query(sql, Map.of("slot", slot, "stations", stations), rs -> {
            Map<String, Double> m = new HashMap<>();
            while (rs.next()) m.put(rs.getString("k"), rs.getDouble("v"));
            return m;
        });
    }

    /** AVG(congestion) by station (daily avg, fallback 2) */
    private Map<String, Double> loadSubwayByStationDailyAvg(List<Route> routes) {
        var stations = routes.stream().map(Route::getStartPoint).filter(this::nz).distinct().toList();
        if (stations.isEmpty()) return Map.of();

        String sql = """
            SELECT station AS k, AVG(congestion) AS v
            FROM subway_congestion
            WHERE station IN (:stations)
            GROUP BY station
        """;
        return jdbc.query(sql, Map.of("stations", stations), rs -> {
            Map<String, Double> m = new HashMap<>();
            while (rs.next()) m.put(rs.getString("k"), rs.getDouble("v"));
            return m;
        });
    }

    // ========= utils =========
    private static String key3(String a, String b, String c){ return nvl(a)+"|"+nvl(b)+"|"+nvl(c); }
    private static String key2(String a, String b){ return nvl(a)+"|"+nvl(b); }
    private static String nvl(String s){ return s==null? "": s; }
    private boolean nz(String s){ return s!=null && !s.isBlank(); }
    private static double clamp01(Double v){ if(v==null) return 0.0; return v<0?0.0:(v>1?1.0:v); }
    private static <T> T firstNonNull(T a, T b){ return a!=null?a:b; }
    private static <T> T firstNonNull(T a, T b, T c){ return a!=null?a:(b!=null?b:c); }
}

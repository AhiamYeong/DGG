package S13P21A305.dgg.waypoint.service;

import S13P21A305.dgg.waypoint.dto.NearbyPoi;
import S13P21A305.dgg.waypoint.dto.StopDto;
import S13P21A305.dgg.waypoint.util.ODsayClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NearbyPoiService {
    private final ODsayClient odsayClient;
    private final StopRankService stopRankService;

    public Mono<List<NearbyPoi>> find(double lat, double lon, int radiusMeters) {
        return odsayClient.getNearby(lat, lon, radiusMeters)
                .map(response -> {
                    if(response == null || response.result() == null || response.result().lane() == null) {
                        return List.<NearbyPoi>of();
                    }

                    return response.result().lane().stream()
                            .filter(l -> l.stationID() != null && l.stationName() != null)
                            .map(l -> new NearbyPoi(
                                    l.stationClass(),
                                    l.stationID(),
                                    l.stationName(),
                                    l.y(),  // 위도
                                    l.x()   // 경도
                            ))
                            //동일 id 중복 제거
                            .collect(Collectors.toMap(
                                    NearbyPoi::stationId,
                                    it -> it,
                                    (a, b) -> a,
                                    LinkedHashMap::new
                            ))
                            .values().stream().toList();
                })
                .flatMap(list -> saveStopsToRedis(list).thenReturn(list));
    }

    private Mono<Void> saveStopsToRedis(List<NearbyPoi> list) {
        if(list == null || list.isEmpty()) {
            return Mono.empty();
        }

        return Mono.fromRunnable(() -> {
            for(NearbyPoi poi : list) {
                StopDto dto = toStopDto(poi);
                //개별 redis에 넣기
                stopRankService.saveOrUpdateStopMaster(dto);
            }
        })
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    private StopDto toStopDto(NearbyPoi p) {
        return new StopDto(
                p.stationId().toString(),
                p.stationName(),
                p.lat(),
                p.lon(),
                mapType(p.type()) // "bus" | "subway"
        );
    }

    private String mapType(int stationClass) {
        return switch (stationClass) {
            case 1 -> "subway";
            case 2 -> "bus";
            default -> "unknown";
        };
    }

    //raw json 그대로
    public Mono<Map<String, Object>> findRaw(double lat, double lon, int radiusMeters) {
        return odsayClient.getNearbyRaw(lat, lon, radiusMeters);
    }
}

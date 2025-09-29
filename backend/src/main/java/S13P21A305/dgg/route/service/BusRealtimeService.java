// BusRealtimeService.java
package S13P21A305.dgg.route.service;

import S13P21A305.dgg.route.dto.BusEtaDTO;

import java.util.Optional;

public interface BusRealtimeService {
	/**
	 * @param stationId ODSay 정류장 ID (문자열)
	 * @param busRouteId ODsay 노선 ID (= busID/laneId)
	 * @return ETA(분) Optional
	 */
	Optional<BusEtaDTO> getEta(String stationId, String busRouteId);
}

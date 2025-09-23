// src/main/java/S13P21A305/dgg/route/domain/Route.java
package S13P21A305.dgg.route.domain;

import lombok.*;
/**
 * 경로의 한 구간(leg).
 * - distanceM: 미터 단위 (버스/지하철/환승 모두 m로 맞춰서 전달)
 * - durationMin: 분 단위
 * - congestionRate: 0~1 (대중교통만 사용, WALKING은 null 또는 0)
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Route {

    private TransportType type;    // SUBWAY | BUS | WALKING
    private double distanceM;      // 미터
    private int    durationMin;    // 분
    private Double congestionRate; // 0~1 (BUS/SUBWAY만 의미있음, WALKING은 null)

    // (선택) 디버그용 라벨
    private String startPoint;
    private String endPoint;
    private String lineName;       // 버스번호/호선명 등 (선호도 가중엔 사용하지 않음)
}

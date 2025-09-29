// BusEtaDTO.java
package S13P21A305.dgg.route.dto;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class BusEtaDTO {
	private Integer etaMin;   // 도착까지 남은 분
	private String  rawMsg;   // 디버깅용
}

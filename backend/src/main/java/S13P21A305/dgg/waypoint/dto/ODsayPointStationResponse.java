package S13P21A305.dgg.waypoint.dto;

import S13P21A305.dgg.global.external.dto.OdSayResponseDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.xml.transform.Result;
import java.util.List;

/**
 * ODsay에서 근접 역 받아올 때, 변환하는 dto
 * ODsay Client에 사용
 * odsay에서 주는 정보 중에 필요한 것만 매핑해서 받음
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ODsayPointStationResponse(@JsonProperty("result") Result result) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Result(
            Integer count,
            List<Lane> lane
    ){}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Lane(
            @JsonProperty("stationClass")
            Integer stationClass,
            @JsonProperty("stationID")
            Integer stationID,
            @JsonProperty("stationName")
            String stationName,
            @JsonProperty("x")
            Double x, //경도
            @JsonProperty("y")
            Double y  //위도
    ) {}
}

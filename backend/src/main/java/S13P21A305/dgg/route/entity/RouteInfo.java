package S13P21A305.dgg.route.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "route_info")
@IdClass(RouteInfoId.class)
@Getter
@Setter
@NoArgsConstructor
public class RouteInfo {

	@Id
	@Column(name = "route_id")
	private Long routeId;

	@Id
	@Column(name = "`order`")
	private Integer order;

	private String departure;
	private String destination;

	@Enumerated(EnumType.STRING)
	private RouteType type; // 교통수단

	@Column(name = "line_name")
	private String lineName;

	@Column(name = "time_taken")
	private Integer timeTaken;

	@Column(name = "walk_distance")
	private Integer walkDistance;

	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "start_lat")
	private Double startLat;

	@Column(name = "start_lng")
	private Double startLng;

	@Column(name = "end_lat")
	private Double endLat;

	@Column(name = "end_lng")
	private Double endLng;

	@Column(name = "bus_route_id")
	private Long busRouteId;

	@Column(name = "bus_station_id")
	private Long busStationId;

	@Column(name = "path_json", columnDefinition = "TEXT")
	private String pathJson;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "route_id", insertable = false, updatable = false)
	private RouteLog routeLog;

	@PrePersist
	public void prePersist() {
		this.createdAt = LocalDateTime.now();
	}
}
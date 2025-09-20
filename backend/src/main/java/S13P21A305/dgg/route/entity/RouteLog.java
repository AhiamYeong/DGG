package S13P21A305.dgg.route.entity;

import static jakarta.persistence.FetchType.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import S13P21A305.dgg.member.domain.Member;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "route_log")
@Getter
@Setter
@NoArgsConstructor
public class RouteLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	private String departure;
	private String destination;

	@Column(name = "predicted_time")
	private Integer predictedTime; // 예상 소요시간

	@Column(name = "time_taken")
	private Integer timeTaken; // 실제 소요시간

	@Column(name = "predicted_fatigue")
	private Integer predictedFatigue; // 예상 피로도

	private Integer fatigue; // 실제 피로도

	@Column(name = "started_at")
	private LocalDateTime startedAt;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	private Boolean used;

	@ManyToOne(fetch = LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	@OneToMany(mappedBy = "routeLog", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<RouteInfo> routeInfos = new ArrayList<>();

	@PrePersist
	public void prePersist() {
		this.createdAt = LocalDateTime.now();
	}

	public void addRouteInfo(RouteInfo routeInfo) {
		routeInfos.add(routeInfo);
		routeInfo.setRouteLog(this);
	}
}

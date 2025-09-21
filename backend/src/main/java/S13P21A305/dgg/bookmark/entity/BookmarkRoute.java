package S13P21A305.dgg.bookmark.entity;

import static jakarta.persistence.FetchType.*;

import java.time.LocalDateTime;

import S13P21A305.dgg.member.domain.Member;
import S13P21A305.dgg.route.entity.RouteType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bookmark_route")
@Getter
@Setter
@NoArgsConstructor
public class BookmarkRoute {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String name; // 즐겨찾기 명

	private String departure; // 출발 장소 이름(가게이름)
	private String destination; // 도착 장소 이름(가게이름)

	@Column(name = "departure_name")
	private String departureName;

	@Column(name = "destination_name")
	private String destinationName;

	@Column(name = "departure_latitude")
	private double departureLatitude;

	@Column(name = "departure_longitude")
	private double departureLongitude;

	@Column(name = "destination_latitude")
	private double destinationLatitude;

	@Column(name = "destination_longitude")
	private double destinationLongitude;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@PrePersist
	void onCreate(){ this.createdAt = LocalDateTime.now(); }

	@Enumerated(EnumType.STRING)
	private RouteType type;

	@ManyToOne(fetch = LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;
}

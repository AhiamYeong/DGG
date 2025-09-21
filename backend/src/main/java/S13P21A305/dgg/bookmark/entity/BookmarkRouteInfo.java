package S13P21A305.dgg.bookmark.entity;

import java.time.LocalDateTime;

import S13P21A305.dgg.route.entity.RouteType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bookmark_route_info")
@IdClass(BookmarkRouteInfoId.class)
@Getter
@Setter
@NoArgsConstructor
public class BookmarkRouteInfo {

	@Id
	@Column(name = "bookmark_id")
	private Long bookmarkId;

	@Id
	@Column(name = "`order`")
	private Integer order;

	@Column(name = "departure_name")
	private String departureName;

	@Column(name = "destination_name")
	private String destinationName;

	@Enumerated(EnumType.STRING)
	private RouteType type;

	@Column(name = "line_name")
	private String lineName;

	@Column(name = "walk_distance")
	private Integer walkDistance;

	@Column(name = "start_lat")
	private Double startLat;

	@Column(name = "start_lng")
	private Double startLng;

	@Column(name = "end_lat")
	private Double endLat;

	@Column(name = "end_lng")
	private Double endLng;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "time_taken")
	private Integer timeTaken; // 소요시간

	@PrePersist
	void onCreate(){ this.createdAt = LocalDateTime.now(); }

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "bookmark_id", insertable = false, updatable = false)
	private BookmarkRoute bookmark;
}

package S13P21A305.dgg.route.entity;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// RouteInfo의 복합키 클래스
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteInfoId implements Serializable {
	private Long routeId;
	private Integer order;

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		RouteInfoId that = (RouteInfoId) o;
		return Objects.equals(routeId, that.routeId) && Objects.equals(order, that.order);
	}

	@Override
	public int hashCode() {
		return Objects.hash(routeId, order);
	}
}
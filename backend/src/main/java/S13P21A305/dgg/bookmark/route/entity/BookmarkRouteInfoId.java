package S13P21A305.dgg.bookmark.route.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BookmarkRouteInfoId implements Serializable { // 복합키
	private Long bookmarkId;
	private Integer order;
}

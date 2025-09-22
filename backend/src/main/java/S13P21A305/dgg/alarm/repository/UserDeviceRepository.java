// UserDeviceRepository.java
package S13P21A305.dgg.alarm.repository;

import S13P21A305.dgg.alarm.domain.UserDevice;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

    @Query("select u.pushToken from UserDevice u where u.memberId = :memberId and u.enabled = true")
    List<String> findActiveTokensByMemberId(@Param("memberId") Integer memberId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update UserDevice u set u.enabled = false where u.pushToken = :token")
    int disableToken(@Param("token") String token);
}

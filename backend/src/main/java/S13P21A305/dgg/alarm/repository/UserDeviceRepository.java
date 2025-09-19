package S13P21A305.dgg.alarm.repository;

import S13P21A305.dgg.alarm.domain.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    Optional<UserDevice> findByPushToken(String token);
    List<UserDevice> findByMemberIdAndIsEnabledTrue(Integer memberId);

}
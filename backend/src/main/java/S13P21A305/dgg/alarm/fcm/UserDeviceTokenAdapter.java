package S13P21A305.dgg.alarm.fcm;

import S13P21A305.dgg.alarm.domain.UserDevice;
import S13P21A305.dgg.alarm.repository.UserDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserDeviceTokenAdapter implements FcmService.UserDeviceTokenPort {

    private final UserDeviceRepository repo;

    @Override
    public List<String> findActiveTokensByMemberId(Integer memberId) {
        return repo.findByMemberIdAndIsEnabledTrue(memberId).stream()
                .map(UserDevice::getPushToken)
                .filter(Objects::nonNull)
                .toList();
    }

    @Override
    @Transactional
    public void disableToken(String token) {
        repo.findByPushToken(token).ifPresent(d -> d.setIsEnabled(false));
        // flush는 트랜잭션 종료 시점에
    }
}

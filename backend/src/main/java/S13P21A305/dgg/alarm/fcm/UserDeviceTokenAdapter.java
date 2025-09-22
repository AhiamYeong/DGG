// UserDeviceTokenAdapter.java  (FcmService.UserDeviceTokenPort 구현)
package S13P21A305.dgg.alarm.fcm;

import S13P21A305.dgg.alarm.repository.UserDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class UserDeviceTokenAdapter implements FcmService.UserDeviceTokenPort {
    private final UserDeviceRepository repo;

    @Override
    public List<String> findActiveTokensByMemberId(Integer memberId) {
        return repo.findActiveTokensByMemberId(memberId);
    }

    @Override
    public void disableToken(String token) {
        repo.disableToken(token);
    }
}

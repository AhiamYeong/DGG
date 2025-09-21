package S13P21A305.dgg.alarm.fcm;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final FirebaseApp firebaseApp;
    private final UserDeviceTokenPort userDeviceTokenPort; // 토큰 조회 포트(아래 주석 참고)

    /**
     * memberId 에 등록된 모든 디바이스로 멀티캐스트 푸시 전송
     */
    public FcmSendResult sendToMember(Integer memberId, String title, String body, Map<String, String> data) {
        List<String> tokens = userDeviceTokenPort.findActiveTokensByMemberId(memberId);

        if (tokens == null || tokens.isEmpty()) {
            log.warn("[FCM] memberId={} active tokens not found", memberId);
            return FcmSendResult.empty();
        }

        Notification notif = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        MulticastMessage.Builder mb = MulticastMessage.builder()
                .addAllTokens(tokens)
                .setNotification(notif);

        if (data != null && !data.isEmpty()) {
            mb.putAllData(data);
        }

        try {
            BatchResponse resp = FirebaseMessaging.getInstance(firebaseApp)
                    .sendEachForMulticast(mb.build());

            int success = resp.getSuccessCount();
            int failure = resp.getFailureCount();

            for (int i = 0; i < resp.getResponses().size(); i++) {
                SendResponse r = resp.getResponses().get(i);
                String token = tokens.get(i); // 요청했던 같은 인덱스의 토큰

                // FcmService 실패 처리 패치
                if (!r.isSuccessful()) {
                    MessagingErrorCode code = r.getException().getMessagingErrorCode();
                    log.warn("[FCM] send fail token={}, code={}, err={}", token, code, r.getException().getMessage());

                    // (1) INVALID_ARGUMENT 은 비활성화하지 않음
                    if (code == MessagingErrorCode.UNREGISTERED) {
                        try {
                            userDeviceTokenPort.disableToken(token);
                            log.info("[FCM] disabled invalid token={}", token);
                        } catch (Exception ignore) {}
                    }
                }
            }

            return new FcmSendResult(tokens.size(), success, failure);
        } catch (Exception e) {
            log.error("[FCM] send error memberId={}, msg={}", memberId, e.getMessage(), e);
            return FcmSendResult.error(tokens.size(), e.getMessage());
        }
    }

    // 결과 DTO
    public record FcmSendResult(int total, int success, int failure, String error) {
        public static FcmSendResult empty() { return new FcmSendResult(0,0,0,null); }
        public static FcmSendResult error(int total, String err) { return new FcmSendResult(total, 0, total, err); }
        public FcmSendResult(int total, int success, int failure) { this(total, success, failure, null); }
    }

    /**
     * 토큰 조회 포트 — 이미 UserDeviceRepository 가 있으면,
     * 이 포트를 구현해서 주입해 주세요.
     */
    // 인터페이스에 비활성화 메서드 하나 추가
    public interface UserDeviceTokenPort {
        List<String> findActiveTokensByMemberId(Integer memberId);
        void disableToken(String token); // 추가
    }

}

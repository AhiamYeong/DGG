// S13P21A305.dgg.alarm.controller.PushTestController
package S13P21A305.dgg.alarm.controller;

import S13P21A305.dgg.alarm.fcm.FcmService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/push")
public class PushTestController {
    @Autowired(required = false)
    private FcmService fcmService;

    @PostMapping("/test")
    public ResponseEntity<?> push(@RequestParam Integer memberId,
                                  @RequestParam(defaultValue = "테스트 푸시") String title,
                                  @RequestParam(defaultValue = "본문") String body) {

        if (fcmService == null) {
            Map<String, Object> resp = new java.util.LinkedHashMap<>();
            resp.put("error", "FCM service is not available");
            return ResponseEntity.ok(resp);
        }

        var res = fcmService.sendToMember(memberId, title, body, Map.of("kind", "test"));

        // Map.of 는 null 금지 → 안전하게 빌더 방식으로
        Map<String, Object> resp = new java.util.LinkedHashMap<>();
        resp.put("total", res.total());
        resp.put("success", res.success());
        resp.put("failure", res.failure());
        if (res.error() != null) { // null이면 넣지 않음
            resp.put("error", res.error());
        }

        return ResponseEntity.ok(resp);
    }
}

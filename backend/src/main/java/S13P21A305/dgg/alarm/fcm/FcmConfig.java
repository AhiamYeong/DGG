package S13P21A305.dgg.alarm.fcm;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

@Slf4j
@Configuration
public class FcmConfig {

    @Value("${fcm.credentials.file:}")
    private String credentialsFilePath;

    @Value("${fcm.credentials.base64:}")
    private String credentialsBase64;

    @Value("${fcm.app.name:dgg-fcm}")
    private String appName;

    @Bean
    public FirebaseApp firebaseApp() throws Exception {
        GoogleCredentials creds;

        if (credentialsFilePath != null && !credentialsFilePath.isBlank()) {
            log.info("[FCM] Init with file: {}", credentialsFilePath);
            try (FileInputStream fis = new FileInputStream(credentialsFilePath)) {
                creds = GoogleCredentials.fromStream(fis);
            }
        } else if (credentialsBase64 != null && !credentialsBase64.isBlank()) {
            log.info("[FCM] Init with base64 credentials");
            byte[] json = java.util.Base64.getDecoder().decode(credentialsBase64);
            try (ByteArrayInputStream bis = new ByteArrayInputStream(json)) {
                creds = GoogleCredentials.fromStream(bis);
            }
        } else {
            throw new IllegalStateException("FCM 자격증명이 없습니다. fcm.credentials.file 또는 fcm.credentials.base64 를 설정하세요.");
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(creds)
                .build();

        // 이미 초기화되어 있으면 재사용
        return FirebaseApp.getApps().stream()
                .filter(a -> a.getName().equals(appName))
                .findFirst()
                .orElseGet(() -> FirebaseApp.initializeApp(options, appName));
    }
}

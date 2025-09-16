package S13P21A305.dgg.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleTokenVerifierService {
    @Value("${GOOGLE_CLIENT_ID}")
    private String clientId;

    // 구글 공개키로 ID 토큰 검증
    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            var transport = new NetHttpTransport();
            var jsonFactory = GsonFactory.getDefaultInstance();

            var verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) return null;
            return idToken.getPayload(); // sub, email, email_verified, name, picture 등
        } catch (Exception e) {
            return null;
        }
    }
}

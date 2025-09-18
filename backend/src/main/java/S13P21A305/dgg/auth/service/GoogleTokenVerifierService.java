package S13P21A305.dgg.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleTokenVerifierService {
    @Value("${GOOGLE_CLIENT_ID}")
    private String clientId;

    // 구글 공개키로 ID 토큰 검증
    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            System.out.println("[GoogleVerify] server clientId = " + clientId);

            var transport = new NetHttpTransport();
            var jsonFactory = GsonFactory.getDefaultInstance();

            var verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(Collections.singletonList(clientId))
                    .setIssuers(Arrays.asList("accounts.google.com", "https://accounts.google.com"))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null){
                System.out.println("[GoogleVerify] idToken 검증 실패 → payload 직접 확인 시작");
                debugIdToken(idTokenString);
                return null;
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            System.out.println("[GoogleVerify] SUCCESS payload.aud = " + payload.getAudience());
            System.out.println("[GoogleVerify] SUCCESS payload.iss = " + payload.getIssuer());
            System.out.println("[GoogleVerify] SUCCESS payload.exp = " + payload.getExpirationTimeSeconds());
            System.out.println("[GoogleVerify] SUCCESS payload.sub = " + payload.getSubject());
            System.out.println("[GoogleVerify] SUCCESS payload.email = " + payload.getEmail());

            return payload;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static void debugIdToken(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            Base64.Decoder decoder = Base64.getUrlDecoder();

            String headerJson = new String(decoder.decode(parts[0]));
            String payloadJson = new String(decoder.decode(parts[1]));

            System.out.println("[GoogleVerify][DEBUG] header = " + headerJson);
            System.out.println("[GoogleVerify][DEBUG] payload = " + payloadJson);
        } catch (Exception e) {
            System.out.println("[GoogleVerify][DEBUG] 토큰 파싱 실패: " + e.getMessage());
        }
    }

}

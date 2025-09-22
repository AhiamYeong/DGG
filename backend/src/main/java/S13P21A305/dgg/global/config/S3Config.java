package S13P21A305.dgg.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class S3Config {

    @Value("${MINIO_ENDPOINT}")
    private String endpoint;

    @Value("${MINIO_REGION:ap-northeast-2}")
    private String region;

    @Value("${MINIO_ACCESS_KEY}")
    private String accessKey;

    @Value("${MINIO_SECRET_KEY}")
    private String secretKey;

    @Value("${MINIO_PATH_STYLE:true}")
    private boolean pathStyle;

    private StaticCredentialsProvider creds() {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
    }

    private S3Configuration s3cfg() {
        return S3Configuration.builder()
                .pathStyleAccessEnabled(pathStyle)
                .build();
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .credentialsProvider(creds())
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .serviceConfiguration(s3cfg())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .credentialsProvider(creds())
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .serviceConfiguration(s3cfg())
                .build();
    }
}

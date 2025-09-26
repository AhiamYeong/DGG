package S13P21A305.dgg.data.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class MinioDataService {

    private final S3Client s3;
    private final S3Presigner presigner;

    @Value("${MINIO_BUCKET}")
    private String bucket;

    public ListObjectsV2Response list(String prefix, String continuationToken, Integer maxKeys) {
        var req = ListObjectsV2Request.builder()
                .bucket(bucket)
                .prefix(prefix == null ? "" : prefix)
                .continuationToken(continuationToken)
                .maxKeys(maxKeys == null ? 1000 : Math.max(1, Math.min(maxKeys, 1000)))
                .build();
        return s3.listObjectsV2(req);
    }

    public HeadObjectResponse head(String key) {
        var req = HeadObjectRequest.builder().bucket(bucket).key(key).build();
        return s3.headObject(req);
    }

    public ResponseInputStream<GetObjectResponse> get(String key) {
        var req = GetObjectRequest.builder().bucket(bucket).key(key).build();
        return s3.getObject(req);
    }

    public String presignGetUrl(String key, int expiresSeconds) {
        var getReq = GetObjectRequest.builder().bucket(bucket).key(key).build();
        var preq = GetObjectPresignRequest.builder()
                .getObjectRequest(getReq)
                .signatureDuration(Duration.ofSeconds(Math.max(1, Math.min(expiresSeconds, 7 * 24 * 3600))))
                .build();
        return presigner.presignGetObject(preq).url().toString();
    }
}

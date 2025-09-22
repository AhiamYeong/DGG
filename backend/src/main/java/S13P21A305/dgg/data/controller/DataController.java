package S13P21A305.dgg.data.controller;

import S13P21A305.dgg.data.dto.response.ListResponse;
import S13P21A305.dgg.data.service.MinioDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class DataController {

    private final MinioDataService service;

    private static void validateKey(String key) {
        if (key == null || key.isBlank()) throw new IllegalArgumentException("key required");
        if (key.contains("..")) throw new IllegalArgumentException("invalid key");
    }

    @GetMapping("/list")
    public ResponseEntity<ListResponse> list(
            @RequestParam(defaultValue = "") String prefix,
            @RequestParam(required = false) String continuationToken,
            @RequestParam(required = false) Integer maxKeys
    ) {
        ListObjectsV2Response res = service.list(prefix, continuationToken, maxKeys);
        List<String> keys = res.contents().stream().map(S3Object::key).toList();
        return ResponseEntity.ok(new ListResponse(keys, res.nextContinuationToken()));
    }

    @GetMapping("/object")
    public ResponseEntity<StreamingResponseBody> get(@RequestParam String key) {
        validateKey(key);
        var head = service.head(key);

        String filename = key.contains("/") ? key.substring(key.lastIndexOf('/') + 1) : key;
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        String contentType = head.contentType() != null ? head.contentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        StreamingResponseBody body = out -> { try (var in = service.get(key)) { in.transferTo(out); } };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded)
                .header(HttpHeaders.ETAG, head.eTag())
                .lastModified(head.lastModified().toEpochMilli())
                .contentLength(head.contentLength())
                .contentType(MediaType.parseMediaType(contentType))
                .body(body);
    }

    @GetMapping("/presign")
    public ResponseEntity<String> presign(@RequestParam String key,
                                          @RequestParam(defaultValue = "300") int expiresSeconds) {
        validateKey(key);
        service.head(key);
        return ResponseEntity.ok(service.presignGetUrl(key, expiresSeconds));
    }
}

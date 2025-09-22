package S13P21A305.dgg.data.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.S3Exception;

@RestControllerAdvice(basePackages = "S13P21A305.dgg.data")
public class S3ExceptionAdvice {

    @ExceptionHandler(NoSuchKeyException.class)
    public ResponseEntity<String> noSuchKey(NoSuchKeyException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No such key");
    }

    @ExceptionHandler(S3Exception.class)
    public ResponseEntity<String> s3(S3Exception e) {
        if (e.statusCode() == 403) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
        if (e.statusCode() == 404) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body("S3 error: " + (e.awsErrorDetails() != null ? e.awsErrorDetails().errorMessage() : e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> bad(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}

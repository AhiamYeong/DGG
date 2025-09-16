# 🔍 네이버 검색 API Spring Boot 구현 명세서

## 📋 개요

프론트엔드에서 네이버 검색 API를 사용하기 위한 Spring Boot 백엔드 프록시 서버 구현 명세서입니다.

**기술 스택:**
- Java 17+
- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- Redis (캐싱)
- MySQL/PostgreSQL

## 🎯 구현 목표

- 네이버 검색 API CORS 문제 해결
- API 키 보안 관리
- 사용량 제한 및 캐싱
- 사용자별 검색 내역 및 즐겨찾기 관리

---

## 🔧 1. 네이버 검색 API 프록시

### 1.1 검색 API 엔드포인트

```http
POST /api/search/places
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**요청 Body:**
```json
{
  "query": "갈비집",
  "display": 5,
  "start": 1,
  "sort": "random"
}
```

**파라미터 설명:**
- `query` (string, required): 검색어
- `display` (number, optional): 표시할 결과 개수 (1-5, 기본값: 5)
- `start` (number, optional): 검색 시작 위치 (1-1000, 기본값: 1)
- `sort` (string, optional): 정렬 방법 ("random" | "comment", 기본값: "random")

**성공 응답 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "unique_place_id",
      "title": "갈비집 강남점",
      "category": "음식점",
      "description": "맛있는 갈비집입니다.",
      "address": "서울특별시 강남구 테헤란로 123",
      "roadAddress": "서울특별시 강남구 테헤란로 123",
      "telephone": "02-1234-5678",
      "coordinates": {
        "x": 311277,
        "y": 552097
      }
    }
  ],
  "total": 10,
  "message": "검색 완료"
}
```

**에러 응답 (400/500):**
```json
{
  "success": false,
  "data": [],
  "total": 0,
  "message": "검색 중 오류가 발생했습니다.",
  "error": "INVALID_QUERY"
}
```

### 1.2 Spring Boot 구현

#### 1.2.1 DTO 클래스

```java
// SearchRequest.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    @NotBlank(message = "검색어는 필수입니다")
    private String query;
    
    @Min(value = 1, message = "display는 1 이상이어야 합니다")
    @Max(value = 5, message = "display는 5 이하여야 합니다")
    private Integer display = 5;
    
    @Min(value = 1, message = "start는 1 이상이어야 합니다")
    @Max(value = 1000, message = "start는 1000 이하여야 합니다")
    private Integer start = 1;
    
    @Pattern(regexp = "random|comment", message = "sort는 random 또는 comment여야 합니다")
    private String sort = "random";
}

// SearchResponse.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse {
    private boolean success;
    private List<PlaceDto> data;
    private Integer total;
    private String message;
    private String error;
}

// PlaceDto.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDto {
    private String id;
    private String title;
    private String category;
    private String description;
    private String address;
    private String roadAddress;
    private String telephone;
    private CoordinatesDto coordinates;
}

// CoordinatesDto.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoordinatesDto {
    private Integer x;
    private Integer y;
}
```

#### 1.2.2 Service 클래스

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class NaverSearchService {
    
    private final RestTemplate restTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Value("${naver.client-id}")
    private String naverClientId;
    
    @Value("${naver.client-secret}")
    private String naverClientSecret;
    
    public SearchResponse searchPlaces(SearchRequest request) {
        String cacheKey = generateCacheKey(request);
        
        try {
            // Redis 캐시 확인
            SearchResponse cachedResponse = (SearchResponse) redisTemplate.opsForValue().get(cacheKey);
            if (cachedResponse != null) {
                log.info("캐시에서 검색 결과 반환: {}", request.getQuery());
                return cachedResponse;
            }
            
            // 네이버 API 호출
            NaverSearchResponse naverResponse = callNaverAPI(request);
            
            // 응답 변환
            SearchResponse response = convertToSearchResponse(naverResponse);
            
            // 캐시 저장 (5분)
            redisTemplate.opsForValue().set(cacheKey, response, Duration.ofMinutes(5));
            
            return response;
            
        } catch (Exception e) {
            log.error("네이버 API 호출 실패: {}", e.getMessage(), e);
            return SearchResponse.builder()
                .success(false)
                .data(Collections.emptyList())
                .total(0)
                .message("검색 중 오류가 발생했습니다.")
                .error("SEARCH_ERROR")
                .build();
        }
    }
    
    private NaverSearchResponse callNaverAPI(SearchRequest request) {
        String url = "https://openapi.naver.com/v1/search/local.json";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", naverClientId);
        headers.set("X-Naver-Client-Secret", naverClientSecret);
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
            .queryParam("query", request.getQuery())
            .queryParam("display", Math.min(request.getDisplay(), 5))
            .queryParam("start", request.getStart())
            .queryParam("sort", request.getSort());
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        ResponseEntity<NaverSearchResponse> response = restTemplate.exchange(
            builder.toUriString(),
            HttpMethod.GET,
            entity,
            NaverSearchResponse.class
        );
        
        return response.getBody();
    }
    
    private SearchResponse convertToSearchResponse(NaverSearchResponse naverResponse) {
        List<PlaceDto> places = naverResponse.getItems().stream()
            .map(this::convertToPlaceDto)
            .collect(Collectors.toList());
        
        return SearchResponse.builder()
            .success(true)
            .data(places)
            .total(naverResponse.getTotal())
            .message("검색 완료")
            .build();
    }
    
    private PlaceDto convertToPlaceDto(NaverSearchItem item) {
        return PlaceDto.builder()
            .id(generatePlaceId(item))
            .title(removeHtmlTags(item.getTitle()))
            .category(item.getCategory())
            .description(removeHtmlTags(item.getDescription()))
            .address(item.getAddress())
            .roadAddress(item.getRoadAddress())
            .telephone(item.getTelephone())
            .coordinates(new CoordinatesDto(
                Integer.parseInt(item.getMapx()),
                Integer.parseInt(item.getMapy())
            ))
            .build();
    }
    
    private String removeHtmlTags(String text) {
        return text.replaceAll("<[^>]*>", "");
    }
    
    private String generatePlaceId(NaverSearchItem item) {
        return item.getMapx() + "_" + item.getMapy() + "_" + System.currentTimeMillis();
    }
    
    private String generateCacheKey(SearchRequest request) {
        return String.format("search:%s:%d:%d:%s", 
            request.getQuery(), 
            request.getDisplay(), 
            request.getStart(), 
            request.getSort());
    }
}
```

#### 1.2.3 Controller 클래스

```java
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
@Validated
public class SearchController {
    
    private final NaverSearchService naverSearchService;
    
    @PostMapping("/places")
    @RateLimiter(name = "search", fallbackMethod = "searchFallback")
    public ResponseEntity<SearchResponse> searchPlaces(
            @Valid @RequestBody SearchRequest request,
            Authentication authentication) {
        
        log.info("검색 요청: {}", request.getQuery());
        
        SearchResponse response = naverSearchService.searchPlaces(request);
        
        // 최근 검색 내역 저장 (비동기)
        if (response.isSuccess() && authentication != null) {
            saveRecentSearchAsync(authentication.getName(), request.getQuery(), response.getTotal());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<SearchResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        
        SearchResponse response = SearchResponse.builder()
            .success(false)
            .data(Collections.emptyList())
            .total(0)
            .message("요청 데이터가 올바르지 않습니다: " + message)
            .error("VALIDATION_ERROR")
            .build();
        
        return ResponseEntity.badRequest().body(response);
    }
    
    public ResponseEntity<SearchResponse> searchFallback(SearchRequest request, Exception ex) {
        log.warn("Rate limit exceeded for search: {}", request.getQuery());
        
        SearchResponse response = SearchResponse.builder()
            .success(false)
            .data(Collections.emptyList())
            .total(0)
            .message("요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.")
            .error("RATE_LIMIT_EXCEEDED")
            .build();
        
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }
}
```

---

## 📚 2. 최근 검색 내역 관리

### 2.1 최근 검색 내역 조회

```http
GET /api/search/recent
Authorization: Bearer {jwt_token}
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "recent_search_id",
      "query": "갈비집",
      "timestamp": "2024-01-15T10:30:00Z",
      "resultCount": 5
    }
  ],
  "message": "최근 검색 내역 조회 완료"
}
```

### 2.2 검색 내역 저장

```http
POST /api/search/recent
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**요청 Body:**
```json
{
  "query": "갈비집",
  "resultCount": 5
}
```

### 2.3 검색 내역 삭제

```http
DELETE /api/search/recent/{id}
Authorization: Bearer {jwt_token}
```

---

## ⭐ 3. 즐겨찾기 관리

### 3.1 즐겨찾기 목록 조회

```http
GET /api/favorites
Authorization: Bearer {jwt_token}
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "favorite_id",
      "title": "갈비집 강남점",
      "category": "음식점",
      "address": "서울특별시 강남구 테헤란로 123",
      "coordinates": {
        "x": 311277,
        "y": 552097
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "즐겨찾기 목록 조회 완료"
}
```

### 3.2 즐겨찾기 추가

```http
POST /api/favorites
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**요청 Body:**
```json
{
  "title": "갈비집 강남점",
  "category": "음식점",
  "address": "서울특별시 강남구 테헤란로 123",
  "roadAddress": "서울특별시 강남구 테헤란로 123",
  "telephone": "02-1234-5678",
  "coordinates": {
    "x": 311277,
    "y": 552097
  }
}
```

### 3.3 즐겨찾기 삭제

```http
DELETE /api/favorites/{id}
Authorization: Bearer {jwt_token}
```

---

## 🔒 4. 보안 및 최적화

### 4.1 Spring Boot 설정

#### 4.1.1 application.yml

```yaml
# application.yml
server:
  port: 8080

spring:
  application:
    name: naver-search-api
  
  # 데이터베이스 설정
  datasource:
    url: jdbc:mysql://localhost:3306/naver_search?useSSL=false&serverTimezone=UTC
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  # JPA 설정
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
  
  # Redis 설정
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0

# 네이버 API 설정
naver:
  client-id: ${NAVER_CLIENT_ID}
  client-secret: ${NAVER_CLIENT_SECRET}

# Rate Limiting 설정
resilience4j:
  ratelimiter:
    instances:
      search:
        limit-for-period: 100
        limit-refresh-period: 60s
        timeout-duration: 1s

# 로깅 설정
logging:
  level:
    com.yourpackage: DEBUG
    org.springframework.web: DEBUG
```

#### 4.1.2 환경 변수 (.env)

```bash
# .env 파일
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
DB_USERNAME=root
DB_PASSWORD=password
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 4.2 의존성 설정 (build.gradle)

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    
    // Resilience4j for Rate Limiting
    implementation 'io.github.resilience4j:resilience4j-spring-boot2'
    implementation 'io.github.resilience4j:resilience4j-ratelimiter'
    
    // Database
    implementation 'mysql:mysql-connector-java'
    
    // JSON Processing
    implementation 'com.fasterxml.jackson.core:jackson-databind'
    
    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    // Test
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

### 4.3 Configuration 클래스

```java
@Configuration
@EnableJpaRepositories
@EnableRedisRepositories
public class AppConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // JSON 직렬화 설정
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
        serializer.setObjectMapper(objectMapper);
        
        template.setDefaultSerializer(serializer);
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);
        
        return template;
    }
}
```

### 4.4 Rate Limiting 설정

```java
@Configuration
public class RateLimitingConfig {
    
    @Bean
    public RateLimiterConfig rateLimiterConfig() {
        return RateLimiterConfig.custom()
            .limitForPeriod(100)
            .limitRefreshPeriod(Duration.ofSeconds(60))
            .timeoutDuration(Duration.ofSeconds(1))
            .build();
    }
}
```

### 4.5 Global Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<SearchResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        
        log.warn("Validation error: {}", message);
        
        SearchResponse response = SearchResponse.builder()
            .success(false)
            .data(Collections.emptyList())
            .total(0)
            .message("요청 데이터가 올바르지 않습니다: " + message)
            .error("VALIDATION_ERROR")
            .build();
        
        return ResponseEntity.badRequest().body(response);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<SearchResponse> handleAccessDeniedException(AccessDeniedException e) {
        log.warn("Access denied: {}", e.getMessage());
        
        SearchResponse response = SearchResponse.builder()
            .success(false)
            .data(Collections.emptyList())
            .total(0)
            .message("인증이 필요합니다.")
            .error("UNAUTHORIZED")
            .build();
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<SearchResponse> handleGenericException(Exception e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        
        SearchResponse response = SearchResponse.builder()
            .success(false)
            .data(Collections.emptyList())
            .total(0)
            .message("서버 내부 오류가 발생했습니다.")
            .error("INTERNAL_SERVER_ERROR")
            .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

---

## 📊 5. 데이터베이스 스키마

### 5.1 JPA Entity 클래스

#### 5.1.1 최근 검색 내역 Entity

```java
@Entity
@Table(name = "recent_searches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentSearch {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "query", nullable = false, length = 255)
    private String query;
    
    @Column(name = "result_count")
    private Integer resultCount = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

#### 5.1.2 즐겨찾기 Entity

```java
@Entity
@Table(name = "favorites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "category", length = 100)
    private String category;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "road_address", columnDefinition = "TEXT")
    private String roadAddress;
    
    @Column(name = "telephone", length = 50)
    private String telephone;
    
    @Column(name = "coordinates_x")
    private Integer coordinatesX;
    
    @Column(name = "coordinates_y")
    private Integer coordinatesY;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 5.2 Repository 인터페이스

```java
@Repository
public interface RecentSearchRepository extends JpaRepository<RecentSearch, String> {
    
    List<RecentSearch> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    void deleteByUserIdAndId(String userId, String id);
    
    @Modifying
    @Query("DELETE FROM RecentSearch r WHERE r.userId = :userId AND r.createdAt < :cutoffDate")
    void deleteOldSearches(@Param("userId") String userId, @Param("cutoffDate") LocalDateTime cutoffDate);
}

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, String> {
    
    List<Favorite> findByUserIdOrderByCreatedAtDesc(String userId);
    
    Optional<Favorite> findByUserIdAndCoordinatesXAndCoordinatesY(String userId, Integer x, Integer y);
    
    void deleteByUserIdAndId(String userId, String id);
}
```

### 5.3 SQL 스키마 (참고용)

```sql
-- 최근 검색 내역 테이블
CREATE TABLE recent_searches (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  query VARCHAR(255) NOT NULL,
  result_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at)
);

-- 즐겨찾기 테이블
CREATE TABLE favorites (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  address TEXT,
  road_address TEXT,
  telephone VARCHAR(50),
  coordinates_x INT,
  coordinates_y INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
```

---

## 🚀 6. 구현 우선순위

### Phase 1 (필수)
1. ✅ 네이버 검색 API 프록시 (`POST /api/search/places`)
2. ✅ 기본 에러 처리
3. ✅ 사용량 제한

### Phase 2 (권장)
1. ✅ 최근 검색 내역 관리
2. ✅ 즐겨찾기 관리
3. ✅ Redis 캐싱

### Phase 3 (최적화)
1. ✅ 데이터베이스 최적화
2. ✅ 로깅 및 모니터링
3. ✅ API 문서화

---

## 📝 7. 프론트엔드 연동

백엔드 구현 완료 후 프론트엔드에서 다음과 같이 변경:

```typescript
// src/services/naverSearchApi.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-server.com/api/search'
  : '/api/naver/v1/search'; // 개발용 프록시
```

---

## 🔗 8. 참고 자료

- [네이버 검색 API 문서](https://developers.naver.com/docs/serviceapi/search/local/local.md)
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Spring Data JPA 문서](https://spring.io/projects/spring-data-jpa)
- [Redis 공식 문서](https://redis.io/docs/)
- [Resilience4j 문서](https://resilience4j.readme.io/docs)

--

## 📝 추가 구현 가이드

### 프로젝트 구조 예시

```
src/main/java/com/yourcompany/naversearch/
├── controller/
│   ├── SearchController.java
│   ├── RecentSearchController.java
│   └── FavoriteController.java
├── service/
│   ├── NaverSearchService.java
│   ├── RecentSearchService.java
│   └── FavoriteService.java
├── repository/
│   ├── RecentSearchRepository.java
│   └── FavoriteRepository.java
├── entity/
│   ├── RecentSearch.java
│   └── Favorite.java
├── dto/
│   ├── SearchRequest.java
│   ├── SearchResponse.java
│   ├── PlaceDto.java
│   └── CoordinatesDto.java
├── config/
│   ├── AppConfig.java
│   ├── RateLimitingConfig.java
│   └── SecurityConfig.java
└── exception/
    └── GlobalExceptionHandler.java
```

### 실행 방법

1. **환경 설정**
   ```bash
   # .env 파일 생성
   cp .env.example .env
   # 환경 변수 설정
   ```

2. **데이터베이스 설정**
   ```bash
   # MySQL 실행
   docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:8.0
   
   # Redis 실행
   docker run -d -p 6379:6379 redis:alpine
   ```

3. **애플리케이션 실행**
   ```bash
   ./gradlew bootRun
   # 또는
   java -jar build/libs/naver-search-api-0.0.1-SNAPSHOT.jar
   ```

4. **API 테스트**
   ```bash
   curl -X POST http://localhost:8080/api/search/places \
     -H "Content-Type: application/json" \
     -d '{"query": "갈비집", "display": 5}'
   ```

# Day 2 — 컨테이너라이징(백/프) · Compose 구동 · Nginx 리버스 프록시(HTTP)

## 개요
Spring Boot 백엔드와 React 프런트를 컨테이너로 빌드하고, Nginx 게이트웨이에서 `/` → 프런트, `/api` → 백엔드로 프록시합니다. Jenkins도 Compose에 포함해 UI 접근을 준비합니다(실사용 파이프라인은 Day 3).

---

## 목표
- 백엔드/프런트 Dockerfile 작성 및 이미지 빌드
- Compose로 MySQL/Redis/Backend/Frontend/Gateway/Jenkins 기동
- HTTP 접근으로 경로 확인

---

## 학습 포인트
- 멀티스테이지 Dockerfile
- Compose 네트워크/볼륨/의존성
- SPA 라우팅(try_files)와 리버스 프록시

---

## 실습 단계

### 1) Backend Dockerfile (Maven 기준)
`infra/backend/Dockerfile`
```dockerfile
# Build
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /build
COPY . .
RUN mvn -q -DskipTests clean package

# Run
FROM eclipse-temurin:17-jre-alpine
ENV TZ=Asia/Seoul
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

> Gradle 사용 시 `./gradlew clean bootJar` 사용, 산출물 경로만 맞추세요.

### 2) Frontend Dockerfile (React + Nginx)
`infra/frontend/Dockerfile`
```dockerfile
# Build
FROM node:20-alpine AS build
WORKDIR /build
COPY . .
RUN npm ci && npm run build

# Serve
FROM nginx:alpine
COPY infra/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/build /usr/share/nginx/html
```

`infra/frontend/nginx.conf`
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;
  location / { try_files $uri /index.html; }
}
```

### 3) Gateway Nginx(리버스 프록시)
`infra/nginx/conf.d/gateway.conf`
```nginx
server {
    listen 80;
    server_name _; # 도메인 사용 시 server_name ${DOMAIN};

    client_max_body_size 20m;
    gzip on;
    gzip_types text/plain text/css application/javascript application/json application/xml;

    # 백엔드 프록시
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 프론트(React 정적) 프록시
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
```

`infra/nginx/Dockerfile`
```dockerfile
FROM nginx:alpine
COPY conf.d/gateway.conf /etc/nginx/conf.d/default.conf
```

### 4) Compose(핵심 스택 + Jenkins)
`infra/docker-compose.prod.yml`
```yaml
name: app
services:
  mysql:
    image: mysql:8.4
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci
    environment:
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks: [internal]

  redis:
    image: redis:7-alpine
    command: ["redis-server","--appendonly","yes"]
    volumes:
      - redis_data:/data
    networks: [internal]

  backend:
    build:
      context: ../..        # 프로젝트 루트 기준
      dockerfile: infra/backend/Dockerfile
    environment:
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
      TZ: ${TIMEZONE}
      DB_URL: jdbc:mysql://mysql:${DB_PORT}/${DB_NAME}?useSSL=false&characterEncoding=utf8
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: ${REDIS_HOST}
      REDIS_PORT: ${REDIS_PORT}
      JWT_SECRET: ${JWT_SECRET}
    depends_on: [mysql, redis]
    networks: [internal]

  frontend:
    build:
      context: ../..        # 프로젝트 루트
      dockerfile: infra/frontend/Dockerfile
    networks: [internal]

  gateway:
    build:
      context: .
      dockerfile: nginx/Dockerfile
    ports:
      - "80:80"
    depends_on: [frontend, backend]
    networks:
      - internal
      - web

  jenkins:
    image: jenkins/jenkins:lts-jdk17
    user: root
    environment:
      JAVA_OPTS: "-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Seoul"
    ports:
      - "8080:8080"     # Jenkins UI (보안그룹/IP 제한 권장)
      - "50000:50000"   # 에이전트 포트(필요 시)
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock  # Jenkins가 호스트 Docker 제어
    networks: [internal]
    restart: unless-stopped

networks:
  internal:
  web:

volumes:
  mysql_data:
  redis_data:
  jenkins_home:
```

### 5) 실행 및 확인
```bash
cd ~/app/infra
cp .env.example .env && vi .env   # 값 채우기
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```
- 앱: `http://<EC2 IP>` (React), `http://<EC2 IP>/api` (백엔드 프록시)
- Jenkins: `http://<EC2 IP>:8080` → 초기 비밀번호: `/var/jenkins_home/secrets/initialAdminPassword`

---

## 산출물 / 체크리스트
- [ ] 백/프 Dockerfile로 이미지 빌드 성공
- [ ] Compose로 핵심 스택 + Jenkins 기동
- [ ] HTTP로 앱/젠킨스 접근 확인
- [ ] Gateway 경로(`/`, `/api/`) 정상 라우팅

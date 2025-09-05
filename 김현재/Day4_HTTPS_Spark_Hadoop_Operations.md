# Day 4 — HTTPS(LE 인증서) · Spark/Hadoop 개발 환경 · 운영 점검

## 개요
Let’s Encrypt로 HTTPS를 설정하고, 필요 시 분리된 Compose 스택으로 Spark(Standalone)와 Hadoop(단일노드) 개발 환경을 추가합니다. 마지막으로 운영 점검 루틴을 정리합니다.

---

## 목표
- Certbot(Webroot)로 HTTPS 적용 및 자동 갱신
- Spark/Hadoop 개발용 컴포즈 스택 구축/테스트
- 운영 점검(로그/리소스/보안) 정리

---

## 학습 포인트
- Nginx 80→443 리다이렉트 + SSL 설정
- Spark 마스터/워커 구조, `spark-submit`
- Hadoop HDFS 단일노드 확인

---

## 실습 단계

### 1) Gateway HTTPS 설정(요지)
`infra/nginx/conf.d/gateway.conf`를 HTTP/HTTPS 이중 서버 블록으로 확장합니다.
```nginx
# 80 → 인증/리다이렉트
server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

# 443 → 실제 서비스
server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    client_max_body_size 20m;
    gzip on;
    gzip_types text/plain text/css application/javascript application/json application/xml;

    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
```

`infra/docker-compose.prod.yml`의 `gateway`에 인증 볼륨 추가:
```yaml
  gateway:
    # ...
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_etc:/etc/letsencrypt

volumes:
  mysql_data:
  redis_data:
  jenkins_home:
  certbot_www:
  certbot_etc:
```

초기 인증(1회, webroot 방식):
```bash
docker run --rm \
  -v certbot_www:/var/www/certbot \
  -v certbot_etc:/etc/letsencrypt \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d ${DOMAIN} --email ${EMAIL_FOR_LETSENCRYPT} --agree-tos --no-eff-email
```

인증 후 게이트웨이 재기동:
```bash
docker compose -f infra/docker-compose.prod.yml up -d --build gateway
```

자동 갱신(크론/Jenkins 스케줄):
```bash
docker run --rm \
  -v certbot_www:/var/www/certbot \
  -v certbot_etc:/etc/letsencrypt \
  certbot/certbot renew --quiet

# 갱신 시 Nginx 재로드
docker compose -f infra/docker-compose.prod.yml exec gateway nginx -s reload || true
```

---

### 2) Spark/Hadoop 개발용 Compose (분리 기동 권장)
`infra/docker-compose.bigdata.yml`
```yaml
name: bigdata
services:
  spark-master:
    image: bitnami/spark:3.5
    environment:
      - SPARK_MODE=master
      - SPARK_RPC_AUTHENTICATION_ENABLED=no
      - SPARK_RPC_ENCRYPTION_ENABLED=no
      - SPARK_LOCAL_DIRS=/tmp
    ports:
      - "7077:7077"   # Spark master
      - "8081:8080"   # Master UI
    networks: [bigdata]

  spark-worker-1:
    image: bitnami/spark:3.5
    environment:
      - SPARK_MODE=worker
      - SPARK_MASTER_URL=spark://spark-master:7077
      - SPARK_WORKER_MEMORY=2G
      - SPARK_WORKER_CORES=2
    depends_on: [spark-master]
    networks: [bigdata]

  # Hadoop 단일노드(개발/체험용)
  hadoop:
    image: harisekhon/hadoop
    hostname: hadoop
    ports:
      - "9870:9870"   # NameNode UI
      - "8088:8088"   # YARN RM UI
    networks: [bigdata]

networks:
  bigdata:
```

기동/테스트:
```bash
docker compose -f infra/docker-compose.bigdata.yml up -d

# Spark 예제: Pi 계산
docker compose -f infra/docker-compose.bigdata.yml exec spark-master \
  spark-submit --master spark://spark-master:7077 \
  --class org.apache.spark.examples.SparkPi \
  /opt/bitnami/spark/examples/jars/spark-examples_2.12-3.5.0.jar 100

# Hadoop HDFS 확인(컨테이너 내부)
docker compose -f infra/docker-compose.bigdata.yml exec hadoop bash -lc 'hdfs dfs -ls /'
```

> 주의: 빅데이터 스택은 리소스 사용량이 큽니다. 운영 스택과 리소스 경쟁이 없도록 필요 시에만 기동하세요.

---

### 3) 운영 점검 루틴
- **로그**: `docker logs <svc>`, Nginx access/error, Spring Boot 로그
- **리소스**: `docker stats`, `htop`, 디스크 `df -h`
- **보안**
  - Jenkins UI 포트는 사내/VPN/IP 제한 권장
  - 관리자 비밀번호 강력 설정, 계정 최소화
  - 정기적 Certbot 갱신/검증

---

## 산출물 / 체크리스트
- [ ] HTTPS 적용(브라우저 🔒 확인)
- [ ] Certbot 갱신 자동화 및 Nginx 재로드
- [ ] Spark/Hadoop 기동 및 예제 실행 결과 확인
- [ ] 운영 점검 체크리스트 문서화

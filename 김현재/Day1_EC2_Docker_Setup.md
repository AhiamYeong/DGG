# Day 1 — EC2 기본 세팅 · Linux 보안 · Docker/Compose 설치

## 개요
EC2(Ubuntu 22.04) 서버를 안전하게 초기화하고, Docker/Compose를 설치하며 작업 디렉토리를 준비합니다. 민감 정보는 `.env`로 분리하고, 리포지토리 기본 트리와 샘플 환경 파일을 마련합니다.

---

## 목표
- 안전한 EC2 초기화(사용자/SSH/UFW/스왑/타임존)
- Docker/Compose 설치 및 작업 디렉토리 준비
- `.env.example` 초안 작성

---

## 학습 포인트
- UFW 포트 정책(22/80/443 최소)
- Docker 권한, Compose 플러그인
- `.env`로 비밀값 분리하기

---

## 사전 준비
- AWS EC2(Ubuntu 22.04 LTS)
- 보안그룹: 22, 80, 443, (필요 시) 8080, 50000(Jenkins 에이전트)
- 도메인(선택), DNS A 레코드 준비
- Git 리포지토리(백엔드: Spring Boot, 프런트: React)

---

## 파일 트리(예시)
```
repo-root/
 ├─ infra/
 │   ├─ docker-compose.prod.yml
 │   ├─ docker-compose.bigdata.yml
 │   ├─ .env.example
 │   ├─ nginx/
 │   │   ├─ Dockerfile
 │   │   └─ conf.d/gateway.conf
 │   ├─ frontend/
 │   │   ├─ Dockerfile
 │   │   └─ nginx.conf
 │   ├─ backend/
 │   │   └─ Dockerfile
 │   └─ scripts/
 │       ├─ deploy.sh
 │       └─ backup-db.sh
 └─ Jenkinsfile
```

---

## 실습 단계

### 1) EC2 접속 및 기본 세팅
```bash
ssh ubuntu@<EC2_PUBLIC_IP>

# 시스템 기본
sudo apt update && sudo apt -y upgrade
sudo timedatectl set-timezone Asia/Seoul
sudo adduser deploy && sudo usermod -aG sudo deploy
# 로컬에서 공개키 등록
# ssh-copy-id deploy@<EC2_PUBLIC_IP>
```

### 2) 방화벽(UFW)
```bash
sudo apt -y install ufw
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3) 스왑(메모리 여유 없을 때)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo swapon -a
```

### 4) Docker & Compose 설치
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# 재로그인 후 확인
docker --version
docker compose version || sudo apt -y install docker-compose-plugin
```

### 5) 도구 및 작업 디렉토리
```bash
sudo apt -y install git curl unzip jq
mkdir -p ~/app/infra/nginx/conf.d ~/app/infra/scripts ~/app/infra/backend ~/app/infra/frontend
```

---

## `.env.example` (운영 시 `.env`로 복사 후 값 입력)
```dotenv
APP_ENV=prod
DOMAIN=example.com
TIMEZONE=Asia/Seoul

DB_HOST=mysql
DB_PORT=3306
DB_NAME=app
DB_USER=appuser
DB_PASSWORD=change_me

REDIS_HOST=redis
REDIS_PORT=6379

SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=change_me

# Jenkins
JENKINS_ADMIN_ID=admin
JENKINS_ADMIN_PASSWORD=change_me_admin_pw

# HTTPS(선택)
EMAIL_FOR_LETSENCRYPT=you@example.com
```

---

## 산출물 / 체크리스트
- [ ] `deploy` 사용자/SSH 키 접속 완료
- [ ] UFW 활성화(22/80/443)
- [ ] Docker/Compose 정상 동작 확인
- [ ] `infra/.env.example` 작성 및 커밋
- [ ] 작업 디렉토리 생성 완료

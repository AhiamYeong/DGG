# Day 3 — Jenkins 파이프라인 구축 · 자동 배포 · DB 백업

## 개요
Jenkins Pipeline으로 리포지토리 변경 시 자동으로 빌드/배포합니다. MySQL 백업 스크립트를 추가해 운영 안정성을 확보합니다.

---

## 목표
- Jenkins 초기 설정 및 플러그인/크레덴셜 구성
- Jenkinsfile로 **빌드 → 배포 → 백업** 자동화
- 스케줄/웹훅 트리거 설정

---

## 학습 포인트
- Declarative Pipeline 구조
- Docker 소켓 공유를 통한 로컬 배포
- 민감정보/환경변수 관리

---

## 실습 단계

### 1) Jenkins 초기 설정
- Jenkins UI 접속: `http://<EC2 IP>:8080`
- 초기 비밀번호 확인: `/var/jenkins_home/secrets/initialAdminPassword`
- 권장 플러그인 설치: **Pipeline**, **Docker Pipeline**, (선택) **Blue Ocean**
- Credentials 등록: Git 접근용 PAT 또는 SSH Key(필요 시)

### 2) Jenkinsfile (리포지토리 루트)
`Jenkinsfile`
```groovy
pipeline {
  agent any

  environment {
    COMPOSE_FILE = 'infra/docker-compose.prod.yml'
    DOCKER_HOST = 'unix:///var/run/docker.sock'
  }

  options {
    timestamps()
    ansiColor('xterm')
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build Images') {
      steps {
        sh \"\"\"
          docker compose -f ${COMPOSE_FILE} build backend frontend gateway
        \"\"\"
      }
    }

    stage('Deploy') {
      steps {
        sh \"\"\"
          docker compose -f ${COMPOSE_FILE} up -d --remove-orphans
          docker image prune -f
        \"\"\"
      }
    }

    stage('DB Backup') {
      when { expression { return env.APP_ENV == 'prod' } }
      steps {
        sh 'bash infra/scripts/backup-db.sh || true'
      }
    }
  }

  post {
    success { echo '✅ Deploy success' }
    failure { echo '❌ Deploy failed' }
  }
}
```

### 3) DB 백업 스크립트
`infra/scripts/backup-db.sh`
```bash
#!/usr/bin/env bash
set -e
STAMP=$(date +%Y%m%d_%H%M%S)
FILE="backup_${STAMP}.sql.gz"
docker compose -f infra/docker-compose.prod.yml exec -T mysql \
  sh -c 'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' | gzip > "$FILE"
echo "Saved: $FILE"
```
```bash
chmod +x infra/scripts/backup-db.sh
```

### 4) Jenkins 잡 생성 & 트리거
- **New Item → Pipeline → Pipeline script from SCM**로 리포지토리 지정
- 빌드 트리거
  - Git Webhook: 푸시 시 자동 실행
  - 또는 스케줄: `H/15 * * * *` (15분 간격 예시)

---

## 팁 & 트러블슈팅
- **권한 문제**: `/var/run/docker.sock` 마운트, Jenkins 컨테이너 `user: root` 유지
- **이미지 누적**: `docker image prune -f`로 정리
- **환경 분리**: 브랜치/변수로 `APP_ENV=dev|staging|prod` 분기 가능

---

## 산출물 / 체크리스트
- [ ] Jenkins 파이프라인 작동(Checkout → Build → Deploy → Backup)
- [ ] Git 푸시 또는 스케줄 트리거로 자동 배포 확인
- [ ] 백업 파일 생성 확인(`backup_YYYYMMDD_HHMMSS.sql.gz`)

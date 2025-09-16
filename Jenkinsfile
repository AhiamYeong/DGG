pipeline {
  agent any
  options { timestamps() }

  environment {
    // --- 정적 배포(프런트) ---
    DEPLOY_DIR = '/var/www/app'

    // --- Docker Hub 설정 ---
    REGISTRY    = 'docker.io'
    IMAGE_NS    = 'dsazxc035'              // Docker Hub 아이디
    REG_CRED_ID = 'dockerhub_registry'     // Jenkins 크리덴셜 ID (Username/Password)

    // 이미지 경로
    IMAGE_NAME  = 'app-backend'
    IMAGE       = "${REGISTRY}/${IMAGE_NS}/${IMAGE_NAME}"

    // 모노레포 경로(백엔드)
    APP_DIR     = 'backend'
    DOCKERFILE  = 'backend/Dockerfile'

    // A 서버에서 docker-compose 위치
    DEPLOY_PATH = '/opt/app-backend'
  }

  stages {
    stage('Checkout') {
      steps {
        // SCM에서 파이프라인 불러오는 설정이면 이 한 줄이면 OK
        checkout scm
      }
    }

    // 필요하면 프런트 빌드 주석 해제
    // stage('Build frontend') {
    //   steps {
    //     sh '''
    //       set -eu
    //       cd frontend
    //       npm ci
    //       npm run build
    //     '''
    //   }
    // }

    stage('Deploy static') {
      steps {
        sh '''
          set -eu
          SRC=""
          if   [ -d static ]; then SRC="static"
          elif [ -d frontend/dist ]; then SRC="frontend/dist"
          elif [ -d frontend/build ]; then SRC="frontend/build"
          else echo "배포 소스(static 또는 frontend/dist|build) 없음"; exit 1; fi

          rsync -av --delete "$SRC"/ ${DEPLOY_DIR}/
          sudo -n /usr/sbin/nginx -t
          sudo -n /bin/systemctl reload nginx
        '''
      }
    }

    // ===== 백엔드 컨테이너 빌드/배포 =====
    stage('Compute Tags') {
      steps {
        script {
          env.SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.DATE  = sh(script: 'date +%Y%m%d', returnStdout: true).trim()
          env.IMMUT = "dev-${env.DATE}-${env.SHORT}" // 불변 태그 (롤백용)
          env.MOVNG = "dev"                          // 이동 태그 (현재 dev)
        }
        sh 'echo "TAGS => ${IMMUT}, ${MOVNG}"'
      }
    }

    stage('Docker Build & Push (Docker Hub)') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.REG_CRED_ID, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh """
            set -eu
            echo "$REG_PASS" | docker login ${REGISTRY} -u "$REG_USER" --password-stdin

            docker build -f ${DOCKERFILE} ${APP_DIR} \
              -t ${IMAGE}:${IMMUT} \
              -t ${IMAGE}:${MOVNG}

            docker push ${IMAGE}:${IMMUT}
            docker push ${IMAGE}:${MOVNG}
          """
        }
      }
    }

    stage('Deploy on A (docker compose)') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.REG_CRED_ID, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh """
            set -eu
            echo "$REG_PASS" | docker login ${REGISTRY} -u "$REG_USER" --password-stdin
            export TAG=${IMMUT}
            cd ${DEPLOY_PATH}
            docker compose pull backend
            docker compose up -d backend
            docker image prune -f
          """
        }
      }
    }
  }

  post {
    success { echo "✅ Static & Backend deployed. Image: ${IMAGE}:${IMMUT}" }
    failure { echo "❌ Deployment failed" }
  }
}

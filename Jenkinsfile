pipeline {
  agent any
  environment { DEPLOY_DIR = '/var/www/app' }

  stages {
    stage('Checkout') {
      steps {
        // 잡을 "Pipeline from SCM"로 만들면, 이 한 줄이면 체크아웃 끝입니다.
        checkout scm
      }
    }

    // (선택) 프런트 빌드가 필요하면 아래 stage의 주석을 해제하세요.
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
  }

  post {
    success { echo 'Deployed to /var/www/app' }
  }
}
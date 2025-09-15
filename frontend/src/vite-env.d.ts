/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAVER_MAP_CLIENT_ID: string
  // 다른 환경 변수들...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAVER_MAP_CLIENT_ID: string
  readonly VITE_API_BASE: string
  // 다른 환경 변수들...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 네이버 지도 API 전역 타입
declare global {
  interface Window {
    naver: any;
  }
}

// API 관련 상수 정의

// API 엔드포인트
export const API_ENDPOINTS = {
  NAVER_SEARCH: '/api/naver/search',
  ROUTE_SEARCH: '/api/route/search',
  TRANSIT: '/api/transit',
  FAVORITES: '/api/favorites'
} as const;

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// API 응답 상태
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// 검색 옵션
export const SEARCH_OPTIONS = {
  DEFAULT_DISPLAY: 10,
  DEFAULT_START: 1,
  DEFAULT_SORT: 'sim'
} as const;

// 디바운스 지연 시간
export const DEBOUNCE_DELAYS = {
  SEARCH: 500,
  INPUT: 300,
  SCROLL: 100
} as const;

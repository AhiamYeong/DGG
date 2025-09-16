// 애플리케이션 상수 정의

/**
 * 경로 관련 상수
 */
export const ROUTE_CONSTANTS = {
  /** 최대 경유지 개수 */
  MAX_WAYPOINTS: 2,
  /** 최대 즐겨찾기 개수 */
  MAX_FAVORITES: 50,
  /** 최대 최근 검색 개수 */
  MAX_RECENT_SEARCHES: 20,
} as const;

/**
 * API 관련 상수
 */
export const API_CONSTANTS = {
  /** API 타임아웃 (밀리초) */
  TIMEOUT: 3000,
  /** 재시도 횟수 */
  MAX_RETRIES: 3,
  /** 페이지당 아이템 수 */
  ITEMS_PER_PAGE: 10,
} as const;

/**
 * UI 관련 상수
 */
export const UI_CONSTANTS = {
  /** 애니메이션 지속 시간 (밀리초) */
  ANIMATION_DURATION: 300,
  /** 토스트 메시지 표시 시간 (밀리초) */
  TOAST_DURATION: 3000,
  /** 디바운스 지연 시간 (밀리초) */
  DEBOUNCE_DELAY: 500,
} as const;

/**
 * 에러 메시지 상수
 */
export const ERROR_MESSAGES = {
  /** 검색 관련 에러 */
  SEARCH: {
    LOAD_RECENT_FAILED: '최근 검색 내역을 불러오는데 실패했습니다.',
    LOAD_FAVORITES_FAILED: '즐겨찾기 장소를 불러오는데 실패했습니다.',
    ADD_RECENT_FAILED: '검색 내역 추가에 실패했습니다.',
    REMOVE_RECENT_FAILED: '최근 검색 내역 삭제에 실패했습니다.',
    ADD_FAVORITE_FAILED: '즐겨찾기 장소 추가에 실패했습니다.',
    REMOVE_FAVORITE_FAILED: '즐겨찾기 장소 삭제에 실패했습니다.',
    REFRESH_FAILED: '데이터를 새로고침하는데 실패했습니다.',
  },
  /** 네트워크 에러 */
  NETWORK: {
    CONNECTION_FAILED: '네트워크 연결에 실패했습니다.',
    TIMEOUT: '요청 시간이 초과되었습니다.',
    UNKNOWN: '알 수 없는 오류가 발생했습니다.',
  },
} as const;

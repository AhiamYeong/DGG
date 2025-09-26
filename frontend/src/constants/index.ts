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
 * 지도 관련 상수
 */
export const MAP_DEFAULTS = {
  DEFAULT_CENTER: { lat: 37.5665, lng: 126.9780 }, // 서울시청
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 10,
  MAX_ZOOM: 20
} as const;

export const MAP_CONTROL_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
} as const;

export const POLYLINE_STYLES = {
  BUS: {
    strokeColor: '#0066CC',
    strokeWeight: 5,
    strokeStyle: 'solid'
  },
  SUBWAY: {
    strokeColor: '#FF0000',
    strokeWeight: 6,
    strokeStyle: 'solid'
  },
  WALK: {
    strokeColor: '#00AA00',
    strokeWeight: 3,
    strokeStyle: 'shortdash'
  }
} as const;

// 호선별 색상 매핑
export const SUBWAY_LINE_COLORS = {
  '1호선': '#0052A4',
  '2호선': '#00C73C', // 초록색으로 변경
  '3호선': '#EF7C1C',
  '4호선': '#00A5DE',
  '5호선': '#996CAC',
  '6호선': '#CD7C2F',
  '7호선': '#747F00',
  '8호선': '#E6186C',
  '9호선': '#BDB092',
  '경의중앙선': '#77C4A3',
  '분당선': '#FFD700', // 금색으로 변경
  '신분당선': '#D4003B',
  '공항철도': '#0090D2',
  '수인분당선': '#FFD700', // 금색으로 변경
  '경춘선': '#0C8E72',
  '우이신설선': '#B7C452',
  '서해선': '#81A914',
  '신림선': '#6789CA',
  '기타': '#FF0000' // 기본값
} as const;

export const TRAFFIC_TYPES = {
  SUBWAY: 1,  // 지하철
  BUS: 2,     // 버스
  WALK: 3     // 도보
} as const;

// 피로도 레벨 매핑 (백분율을 1-5단계로 변환)
export const FATIGUE_LEVELS = {
  LEVEL_1: { min: 0, max: 20, label: '매우 낮음', color: '#4CAF50' },
  LEVEL_2: { min: 21, max: 40, label: '낮음', color: '#8BC34A' },
  LEVEL_3: { min: 41, max: 60, label: '보통', color: '#FFC107' },
  LEVEL_4: { min: 61, max: 80, label: '높음', color: '#FF9800' },
  LEVEL_5: { min: 81, max: 100, label: '매우 높음', color: '#F44336' }
} as const;

// 피로도 백분율을 레벨로 변환하는 함수
export const getFatigueLevel = (fatiguePercentage: number): { level: number; label: string; color: string } => {
  if (fatiguePercentage <= 20) {
    return { level: 1, ...FATIGUE_LEVELS.LEVEL_1 };
  } else if (fatiguePercentage <= 40) {
    return { level: 2, ...FATIGUE_LEVELS.LEVEL_2 };
  } else if (fatiguePercentage <= 60) {
    return { level: 3, ...FATIGUE_LEVELS.LEVEL_3 };
  } else if (fatiguePercentage <= 80) {
    return { level: 4, ...FATIGUE_LEVELS.LEVEL_4 };
  } else {
    return { level: 5, ...FATIGUE_LEVELS.LEVEL_5 };
  }
};

export const MARKER_ICONS = {
  START: {
    content: '<div style="background: #00AA00; color: white; padding: 5px; border-radius: 50%; font-size: 12px; font-weight: bold;">출발</div>',
    size: { width: 40, height: 40 },
    anchor: { x: 20, y: 20 }
  },
  END: {
    content: '<div style="background: #FF0000; color: white; padding: 5px; border-radius: 50%; font-size: 12px; font-weight: bold;">도착</div>',
    size: { width: 40, height: 40 },
    anchor: { x: 20, y: 20 }
  }
} as const;

/**
 * UI 컴포넌트 관련 상수
 */
export const ICON_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const;

export const BUTTON_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
} as const;

export const BUTTON_VARIANTS = {
  LOCATION: 'location',
  POLYLINE: 'polyline',
  REMOVE: 'remove',
  CUSTOM: 'custom'
} as const;

export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

export const Z_INDEX = {
  MAP: 0,
  UI: 10,
  MODAL: 20,
  TOOLTIP: 30,
  DROPDOWN: 40
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

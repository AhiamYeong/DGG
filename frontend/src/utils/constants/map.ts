// 지도 관련 상수 정의

// 지도 기본 설정
export const MAP_DEFAULTS = {
  DEFAULT_CENTER: { lat: 37.5665, lng: 126.9780 }, // 서울시청
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 10,
  MAX_ZOOM: 20
} as const;

// 지도 컨트롤 위치
export const MAP_CONTROL_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
} as const;

// 폴리라인 스타일
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

// 교통수단 타입
export const TRAFFIC_TYPES = {
  BUS: 1,
  SUBWAY: 2,
  WALK: 3
} as const;

// 마커 아이콘 스타일
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

// UI 관련 상수 정의

// 아이콘 크기
export const ICON_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const;

// 버튼 크기
export const BUTTON_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
} as const;

// 버튼 variant
export const BUTTON_VARIANTS = {
  LOCATION: 'location',
  POLYLINE: 'polyline',
  REMOVE: 'remove',
  CUSTOM: 'custom'
} as const;

// 색상 팔레트
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

// 애니메이션 지속 시간
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

// z-index 레이어
export const Z_INDEX = {
  MAP: 0,
  UI: 10,
  MODAL: 20,
  TOOLTIP: 30,
  DROPDOWN: 40
} as const;

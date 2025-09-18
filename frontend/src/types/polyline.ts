import type { NaverLatLng, NaverMapInstance } from './naver-map';

export interface NaverPolylineOptions {
  map: NaverMapInstance;
  path: NaverLatLng[];
  strokeColor: string;
  strokeWeight: number;
  strokeStyle: string;
}

export interface NaverPolylineInstance {
  setMap: (map: NaverMapInstance | null) => void;
  setPath: (path: NaverLatLng[]) => void;
}

// 폴리라인 스타일 타입
export interface PolylineStyle {
  strokeColor: string;
  strokeWeight: number;
  strokeStyle: string;
}

// 교통수단별 스타일 매핑
export const POLYLINE_STYLES = {
  BUS: { strokeColor: '#0066CC', strokeWeight: 5, strokeStyle: 'solid' },
  SUBWAY: { strokeColor: '#FF0000', strokeWeight: 6, strokeStyle: 'solid' },
  WALK: { strokeColor: '#00AA00', strokeWeight: 3, strokeStyle: 'shortdash' }
} as const;

export type TrafficType = keyof typeof POLYLINE_STYLES;

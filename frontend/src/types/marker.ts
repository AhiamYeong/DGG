import type { NaverLatLng, NaverMapInstance } from './naver-map';

export interface NaverMarker {
  setPosition: (position: any) => void;
  setMap: (map: NaverMapInstance | null) => void;
}

export interface NaverMarkerOptions {
  position: NaverLatLng;
  map: NaverMapInstance;
  title?: string;
  icon?: {
    content: string;
    size: NaverSize;
    anchor: NaverPoint;
  };
}

export interface NaverMarkerInstance {
  setMap: (map: NaverMapInstance | null) => void;
  getPosition: () => NaverLatLng;
}

export interface NaverSize {
  width: number;
  height: number;
}

export interface NaverPoint {
  x: number;
  y: number;
}

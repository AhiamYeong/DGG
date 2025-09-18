import type { NaverMapInstance } from './naver-map';
import type { NaverMarkerInstance } from './marker';

export interface NaverInfoWindow {
  open: (map: NaverMapInstance, marker: any) => void;
  close: () => void;
  getMap: () => NaverMapInstance | null;
}

export interface NaverInfoWindowOptions {
  content: string;
}

export interface NaverInfoWindowInstance {
  open: (map: NaverMapInstance, marker: NaverMarkerInstance) => void;
  close: () => void;
  getMap: () => NaverMapInstance | null;
}

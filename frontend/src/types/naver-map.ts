// 네이버 Map API 타입 정의

export interface NaverMapLocation {
  lat: number;
  lng: number;
}

export interface NaverMapProps {
  width?: string;
  height?: string;
  center?: NaverMapLocation;
  zoom?: number;
}

export interface NaverMapInstance {
  destroy: () => void;
  setCenter: (center: NaverMapLocation) => void;
  setZoom: (zoom: number) => void;
}

export interface NaverMarker {
  setPosition: (position: NaverMapLocation) => void;
  setMap: (map: NaverMapInstance | null) => void;
}

export interface NaverInfoWindow {
  open: (map: NaverMapInstance, marker: NaverMarker) => void;
  close: () => void;
  getMap: () => NaverMapInstance | null;
}

// 네이버 Map API 옵션 타입들
export interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
  mapTypeControl?: boolean;
  mapTypeControlOptions?: {
    style: number;
    position: number;
  };
  zoomControl?: boolean;
  zoomControlOptions?: {
    style: number;
    position: number;
  };
}

export interface NaverLatLng {
  _lat: number;
  _lng: number;
  lat(): number;
  lng(): number;
}

export interface NaverMarkerOptions {
  position: NaverLatLng;
  map: NaverMapInstance;
  title?: string;
}

export interface NaverMarkerInstance {
  setMap: (map: NaverMapInstance | null) => void;
  getPosition: () => NaverLatLng;
}

export interface NaverInfoWindowOptions {
  content: string;
}

export interface NaverInfoWindowInstance {
  open: (map: NaverMapInstance, marker: NaverMarkerInstance) => void;
  close: () => void;
  getMap: () => NaverMapInstance | null;
}

// 네이버 Map API 전역 타입
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMapInstance;
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Marker: new (options: NaverMarkerOptions) => NaverMarkerInstance;
        InfoWindow: new (options: NaverInfoWindowOptions) => NaverInfoWindowInstance;
        Event: {
          addListener: (target: NaverMapInstance | NaverMarkerInstance, event: string, listener: () => void) => void;
        };
        MapTypeControlStyle: {
          BUTTON: string;
        };
        Position: {
          TOP_RIGHT: string;
          RIGHT_CENTER: string;
        };
        ZoomControlStyle: {
          SMALL: string;
        };
      };
    };
    navermap_authFailure: () => void;
  }
}

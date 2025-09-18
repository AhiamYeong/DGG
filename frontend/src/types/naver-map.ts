// 네이버 Map API 기본 타입 정의

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

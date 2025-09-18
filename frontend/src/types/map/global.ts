import type { 
  NaverMapOptions, 
  NaverMapInstance, 
  NaverLatLng 
} from './naver-map';
import type { 
  NaverMarkerOptions, 
  NaverMarkerInstance, 
  NaverSize, 
  NaverPoint 
} from './marker';
import type { 
  NaverInfoWindowOptions, 
  NaverInfoWindowInstance 
} from './infowindow';
import type { 
  NaverPolylineOptions, 
  NaverPolylineInstance 
} from './polyline';

// 네이버 Map API 전역 타입 선언
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMapInstance;
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Marker: new (options: NaverMarkerOptions) => NaverMarkerInstance;
        InfoWindow: new (options: NaverInfoWindowOptions) => NaverInfoWindowInstance;
        Polyline: new (options: NaverPolylineOptions) => NaverPolylineInstance;
        Size: new (width: number, height: number) => NaverSize;
        Point: new (x: number, y: number) => NaverPoint;
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

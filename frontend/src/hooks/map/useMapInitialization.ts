import { useState, useRef, useCallback } from 'react';
import { loadNaverMapScript } from '../../services/mapApi';
import type { NaverMapLocation, NaverMapInstance } from '../../types/map';
import { MAP_DEFAULTS } from '../../utils/constants';

/**
 * 지도 초기화를 담당하는 커스텀 훅
 * 네이버 지도 API 로딩 및 지도 인스턴스 생성
 */
export function useMapInitialization() {
  const [map, setMap] = useState<NaverMapInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // 네이버 지도 초기화
  const initializeMap = useCallback((center: NaverMapLocation, zoom: number = MAP_DEFAULTS.DEFAULT_ZOOM) => {
    // 인증 실패 감지 함수 설정
    (window as Window & { navermap_authFailure?: () => void }).navermap_authFailure = () => {
      console.error('네이버 Map API 인증 실패');
      alert('네이버 Map API 인증에 실패했습니다. API 키와 도메인 설정을 확인해주세요.');
    };

    // 네이버 Map API 동적 로딩
    const loadNaverMapAPI = async () => {
      await loadNaverMapScript();
      return window.naver;
    };

    // API 로드 및 지도 초기화
    loadNaverMapAPI()
      .then((naver: any) => {
        if (mapRef.current && naver.maps) {
          const mapInstance = new naver.maps.Map(mapRef.current, {
            center: new naver.maps.LatLng(center.lat, center.lng),
            zoom: zoom,
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: naver.maps.MapTypeControlStyle.BUTTON as any,
              position: naver.maps.Position.TOP_RIGHT as any
            },
            zoomControl: true,
            zoomControlOptions: {
              style: naver.maps.ZoomControlStyle.SMALL as any,
              position: naver.maps.Position.RIGHT_CENTER as any
            }
          });

          // 마커 추가 (네이버 좌표계 사용)
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(center.lat, center.lng),
            map: mapInstance,
            title: '현재 위치'
          });

          // 정보창 추가
          const infoWindow = new naver.maps.InfoWindow({
            content: '<div style="padding:10px; font-size:14px;"><strong>현재 위치</strong><br/>네이버 지도 API</div>'
          });

          // 마커 클릭 시 정보창 표시
          naver.maps.Event.addListener(marker, 'click', () => {
            if (infoWindow.getMap()) {
              infoWindow.close();
            } else {
              infoWindow.open(mapInstance, marker);
            }
          });

          setMap(mapInstance);
          setIsLoaded(true);
        }
      })
      .catch((error) => {
        console.error('지도 초기화 실패:', error);
      });
  }, [mapRef]);

  // 지도 정리
  const cleanupMap = useCallback(() => {
    if (map) {
      map.destroy();
    }
  }, [map]);

  return {
    map,
    isLoaded,
    mapRef,
    initializeMap,
    cleanupMap
  };
}

import { useState, useRef, useCallback } from 'react';
import { loadNaverMapScript } from '@/api/mapApi';
import type { NaverMapLocation, NaverMapInstance } from '@/types/map';
import { MAP_DEFAULTS } from '../constants';

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

          // 초기 마커는 제거 - 필요시 useMarker 훅에서 생성

          // 맵 클릭 이벤트 추가 - 좌표를 콘솔에 출력
          naver.maps.Event.addListener(mapInstance, 'click', (e: any) => {
            const lat = e.coord.lat();
            const lng = e.coord.lng();
            console.log('🗺️ 맵 클릭 좌표:', {
              lat: lat,
              lng: lng,
              latLng: `${lat}, ${lng}`,
              timestamp: new Date().toLocaleString()
            });
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

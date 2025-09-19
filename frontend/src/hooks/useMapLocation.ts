import { useState, useCallback } from 'react';
import type { NaverMapLocation, NaverMapInstance } from '@/types/map';
import { MAP_DEFAULTS } from '../constants';

/**
 * 지도 위치 관리를 담당하는 커스텀 훅
 * 현재 위치 가져오기 및 지도 위치 업데이트
 */
export function useMapLocation() {
  const [currentLocation, setCurrentLocation] = useState<NaverMapLocation>(MAP_DEFAULTS.DEFAULT_CENTER);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          alert('위치 정보를 가져올 수 없습니다.');
        }
      );
    } else {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  }, []);

  // 지도 위치 업데이트
  const updateMapLocation = useCallback((newLocation: NaverMapLocation, map: NaverMapInstance | null) => {
    if (map && window.naver && window.naver.maps) {
      const newCenter = new window.naver.maps.LatLng(newLocation.lat, newLocation.lng);
      map.setCenter(newCenter as any);
    }
  }, []);

  // 경로 시작점으로 지도 이동
  const centerMapToRouteStart = useCallback((route: any, map: NaverMapInstance | null) => {
    if (!map || !window.naver || !window.naver.maps || !route) {
      return;
    }

    // 경로의 첫 번째 구간에서 시작 좌표 찾기
    let startLocation: NaverMapLocation | null = null;

    if (route.rawData && route.rawData.subPath && route.rawData.subPath.length > 0) {
      const firstSubPath = route.rawData.subPath[0];
      
      // passStopList.stations에서 첫 번째 역/정류장 좌표 사용
      if (firstSubPath.passStopList?.stations && firstSubPath.passStopList.stations.length > 0) {
        const firstStation = firstSubPath.passStopList.stations[0];
        startLocation = {
          lat: parseFloat(firstStation.y),
          lng: parseFloat(firstStation.x)
        };
      }
      // startX, startY가 있는 경우 사용
      else if (firstSubPath.startX && firstSubPath.startY) {
        startLocation = {
          lat: firstSubPath.startY,
          lng: firstSubPath.startX
        };
      }
    }

    // 시작 좌표가 있으면 지도 중심 이동
    if (startLocation) {
      const newCenter = new window.naver.maps.LatLng(startLocation.lat, startLocation.lng);
      map.setCenter(newCenter as any);
      
      // 적절한 줌 레벨로 설정 (경로 전체를 볼 수 있도록)
      map.setZoom(12);
      
      console.log('지도를 경로 시작점으로 이동:', startLocation);
    }
  }, []);

  return {
    currentLocation,
    setCurrentLocation,
    getCurrentLocation,
    updateMapLocation,
    centerMapToRouteStart
  };
}

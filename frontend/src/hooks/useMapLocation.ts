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

  return {
    currentLocation,
    setCurrentLocation,
    getCurrentLocation,
    updateMapLocation
  };
}

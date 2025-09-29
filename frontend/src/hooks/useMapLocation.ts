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
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          return newLocation;
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          // 기본 위치로 설정 (강남역)
          const defaultLocation = {
            lat: 37.497952,
            lng: 127.027619
          };
          setCurrentLocation(defaultLocation);
          return defaultLocation;
        }
      );
    } else {
      // 기본 위치로 설정 (강남역)
      const defaultLocation = {
        lat: 37.497952,
        lng: 127.027619
      };
      setCurrentLocation(defaultLocation);
      return defaultLocation;
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

    // 경로의 시작 좌표 찾기
    let startLocation: NaverMapLocation | null = null;

    // 1. JSON 데이터에서 첫 번째 단계의 출발 좌표 찾기 (최우선)
    const routeData = route.rawData || route.polylineData;
    if (routeData && routeData.data && Array.isArray(routeData.data) && routeData.data.length > 0) {
      // 첫 번째 단계에서 출발 좌표 찾기
      const firstStep = routeData.data[0];
      if (firstStep.startLat && firstStep.startLng) {
        startLocation = {
          lat: firstStep.startLat,
          lng: firstStep.startLng
        };
      }
      // 첫 번째 단계에 좌표가 없으면 다음 단계들에서 찾기
      else {
        for (let i = 1; i < routeData.data.length; i++) {
          const step = routeData.data[i];
          if (step.startLat && step.startLng) {
            startLocation = {
              lat: step.startLat,
              lng: step.startLng
            };
            break;
          }
        }
      }
    }
    // 2. route.from에 좌표가 있는 경우
    else if (route.from && route.from.latitude && route.from.longitude) {
      startLocation = {
        lat: route.from.latitude,
        lng: route.from.longitude
      };
    }
    // 3. rawData의 subPath에서 첫 번째 유효한 좌표 찾기
    else if (route.rawData && route.rawData.subPath && route.rawData.subPath.length > 0) {
      for (let i = 0; i < route.rawData.subPath.length; i++) {
        const subPath = route.rawData.subPath[i];
        
        // passStopList.stations에서 첫 번째 역/정류장 좌표 사용
        if (subPath.passStopList?.stations && subPath.passStopList.stations.length > 0) {
          const firstStation = subPath.passStopList.stations[0];
          startLocation = {
            lat: parseFloat(firstStation.y),
            lng: parseFloat(firstStation.x)
          };
          break;
        }
        // startX, startY가 있는 경우 사용
        else if (subPath.startX && subPath.startY) {
          startLocation = {
            lat: subPath.startY,
            lng: subPath.startX
          };
          break;
        }
        // startExitX, startExitY가 있는 경우 사용 (도보 구간)
        else if (subPath.startExitX && subPath.startExitY) {
          startLocation = {
            lat: subPath.startExitY,
            lng: subPath.startExitX
          };
          break;
        }
      }
    }
    
    // 4. 여전히 좌표를 찾지 못한 경우 강남역 좌표 사용 (폴백)
    if (!startLocation) {
      startLocation = {
        lat: 37.497952,
        lng: 127.027619
      };
    }

    // 시작 좌표가 있으면 지도 중심 이동
    if (startLocation) {
      const newCenter = new window.naver.maps.LatLng(startLocation.lat, startLocation.lng);
      
      // 지도 중심 이동
      map.setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
      
      // 줌 레벨 설정
      map.setZoom(16);
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

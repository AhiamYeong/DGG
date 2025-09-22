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
    console.log('centerMapToRouteStart 호출됨:', { route, map });
    
    if (!map || !window.naver || !window.naver.maps || !route) {
      console.log('centerMapToRouteStart: 조건 불만족', { 
        hasMap: !!map, 
        hasNaver: !!window.naver, 
        hasMaps: !!window.naver?.maps, 
        hasRoute: !!route 
      });
      return;
    }

    // 경로의 시작 좌표 찾기
    let startLocation: NaverMapLocation | null = null;

    console.log('route.rawData 확인:', route.rawData);
    console.log('route.from 확인:', route.from);

    // 1. route.from에 좌표가 있는 경우 (가장 우선)
    if (route.from && route.from.latitude && route.from.longitude) {
      startLocation = {
        lat: route.from.latitude,
        lng: route.from.longitude
      };
      console.log('route.from에서 좌표 추출:', startLocation);
    }
    // 2. rawData의 subPath에서 첫 번째 유효한 좌표 찾기
    else if (route.rawData && route.rawData.subPath && route.rawData.subPath.length > 0) {
      // 모든 subPath를 확인하여 첫 번째 유효한 좌표 찾기
      for (let i = 0; i < route.rawData.subPath.length; i++) {
        const subPath = route.rawData.subPath[i];
        console.log(`${i}번째 subPath:`, subPath);
        
        // passStopList.stations에서 첫 번째 역/정류장 좌표 사용
        if (subPath.passStopList?.stations && subPath.passStopList.stations.length > 0) {
          const firstStation = subPath.passStopList.stations[0];
          startLocation = {
            lat: parseFloat(firstStation.y),
            lng: parseFloat(firstStation.x)
          };
          console.log(`${i}번째 subPath의 passStopList에서 좌표 추출:`, startLocation);
          break;
        }
        // startX, startY가 있는 경우 사용
        else if (subPath.startX && subPath.startY) {
          startLocation = {
            lat: subPath.startY,
            lng: subPath.startX
          };
          console.log(`${i}번째 subPath의 startX/Y에서 좌표 추출:`, startLocation);
          break;
        }
        // startExitX, startExitY가 있는 경우 사용 (도보 구간)
        else if (subPath.startExitX && subPath.startExitY) {
          startLocation = {
            lat: subPath.startExitY,
            lng: subPath.startExitX
          };
          console.log(`${i}번째 subPath의 startExitX/Y에서 좌표 추출:`, startLocation);
          break;
        }
      }
    }
    
    // 3. 여전히 좌표를 찾지 못한 경우 강남역 좌표 사용 (폴백)
    if (!startLocation) {
      startLocation = {
        lat: 37.497952,
        lng: 127.027619
      };
      console.log('폴백: 강남역 좌표 사용:', startLocation);
    }

    // 시작 좌표가 있으면 지도 중심 이동
    if (startLocation) {
      console.log('지도 중심 이동 시작:', startLocation);
      const newCenter = new window.naver.maps.LatLng(startLocation.lat, startLocation.lng);
      
      // 지도 중심 이동 (setCenter 사용)
      map.setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
      
      // 약간의 지연 후 줌 레벨 설정
      setTimeout(() => {
        map.setZoom(16);
        console.log('지도를 경로 시작점으로 클로즈업 완료:', startLocation);
      }, 100);
      
    } else {
      console.log('시작 좌표를 찾을 수 없음');
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

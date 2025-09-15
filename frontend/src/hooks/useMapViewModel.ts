import React, { useState, useRef, useCallback } from 'react';
import type { NaverMapLocation, NaverMapInstance } from '../types/naver-map';

export function useMapViewModel() {
  const [currentLocation, setCurrentLocation] = useState<NaverMapLocation>({
    lat: 37.5665,
    lng: 126.9780
  });

  const [map, setMap] = useState<NaverMapInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

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

  // 길찾기 검색 처리
  const handleSearch = useCallback((origin: string, destination: string, waypoints?: string[]) => {
    console.log('길찾기 검색:', { origin, destination, waypoints });
    // TODO: 실제 길찾기 API 호출 및 경로 표시
    if (waypoints && waypoints.length > 0) {
      console.log('경유지 포함:', waypoints);
    }
  }, []);

  // 네이버 지도 초기화
  const initializeMap = useCallback((center: NaverMapLocation, zoom: number = 15) => {
    // 인증 실패 감지 함수 설정
    (window as Window & { navermap_authFailure?: () => void }).navermap_authFailure = () => {
      console.error('네이버 Map API 인증 실패');
      alert('네이버 Map API 인증에 실패했습니다. API 키와 도메인 설정을 확인해주세요.');
    };

    // 네이버 Map API 동적 로딩
    const loadNaverMapAPI = () => {
      return new Promise((resolve, reject) => {
        // 이미 로드되어 있는지 확인
        if (window.naver && window.naver.maps) {
          resolve(window.naver);
          return;
        }

        // 스크립트 태그 생성
        const script = document.createElement('script');
        const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
        console.log('API Key:', clientId); // 디버깅용
        
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        script.async = true;
        
        script.onload = () => {
          console.log('네이버 Map API 로드 완료');
          resolve(window.naver);
        };
        
        script.onerror = () => {
          console.error('네이버 Map API 로드 실패');
          reject(new Error('네이버 Map API 로드 실패'));
        };

        document.head.appendChild(script);
      });
    };

    // API 로드 및 지도 초기화
    loadNaverMapAPI()
      .then((naver: typeof window.naver) => {
        if (mapRef.current && naver.maps) {
          const mapInstance = new naver.maps.Map(mapRef.current, {
            center: new naver.maps.LatLng(center.lat, center.lng),
            zoom: zoom,
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: naver.maps.MapTypeControlStyle.BUTTON,
              position: naver.maps.Position.TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
              style: naver.maps.ZoomControlStyle.SMALL,
              position: naver.maps.Position.RIGHT_CENTER
            }
          });

          // 마커 추가
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

  // 지도 위치 업데이트
  const updateMapLocation = useCallback((newLocation: NaverMapLocation) => {
    if (map && window.naver && window.naver.maps) {
      const newCenter = new window.naver.maps.LatLng(newLocation.lat, newLocation.lng);
      map.setCenter(newCenter);
    }
  }, [map]);

  // currentLocation이 변경될 때 지도 위치 업데이트
  React.useEffect(() => {
    if (map && isLoaded) {
      updateMapLocation(currentLocation);
    }
  }, [currentLocation, map, isLoaded, updateMapLocation]);

  return {
    // State
    currentLocation,
    map,
    isLoaded,
    mapRef,
    
    // Actions
    getCurrentLocation,
    handleSearch,
    initializeMap,
    cleanupMap,
    setCurrentLocation,
    updateMapLocation
  };
}

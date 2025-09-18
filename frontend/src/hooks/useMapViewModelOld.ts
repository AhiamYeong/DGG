import React, { useState, useRef, useCallback } from 'react';
import { loadNaverMapScript } from '../services/mapApi';
import type { NaverMapLocation, NaverMapInstance } from '../types/map';

// ODsay API 응답을 흉내 내는 더미 데이터 타입
interface DummySubPath {
  trafficType: number; // 1: 버스, 2: 지하철, 3: 걷기
  passShape: {
    geojson: {
      coordinates: number[][]; // [lng, lat] 배열
    };
  };
}

// 교통수단별 스타일 매핑
const styleMap = {
  1: { // 버스
    strokeColor: '#0066CC',
    strokeWeight: 5,
    strokeStyle: 'solid'
  },
  2: { // 지하철
    strokeColor: '#FF0000',
    strokeWeight: 6,
    strokeStyle: 'solid'
  },
  3: { // 걷기
    strokeColor: '#00AA00',
    strokeWeight: 3,
    strokeStyle: 'shortdash'
  }
};

// 강남역 -> 성수역 더미 데이터
const dummySubPath: DummySubPath[] = [
  {
    trafficType: 3, // 걷기
    passShape: {
      geojson: {
        coordinates: [
          [127.0276, 37.4979], // 강남역 출구
          [127.0280, 37.4982], // 강남역 근처
          [127.0285, 37.4985]  // 지하철역 입구
        ]
      }
    }
  },
  {
    trafficType: 2, // 지하철 (2호선)
    passShape: {
      geojson: {
        coordinates: [
          [127.0285, 37.4985], // 강남역
          [127.0290, 37.4990], // 선릉역
          [127.0295, 37.4995], // 삼성역
          [127.0300, 37.5000], // 종합운동장역
          [127.0305, 37.5005], // 잠실역
          [127.0310, 37.5010], // 잠실나루역
          [127.0315, 37.5015], // 강변역
          [127.0320, 37.5020], // 구의역
          [127.0325, 37.5025], // 건대입구역
          [127.0330, 37.5030], // 성수역
          [127.0335, 37.5035]  // 성수역 플랫폼
        ]
      }
    }
  },
  {
    trafficType: 3, // 걷기
    passShape: {
      geojson: {
        coordinates: [
          [127.0335, 37.5035], // 성수역 플랫폼
          [127.0340, 37.5040], // 성수역 출구
          [127.0345, 37.5045]  // 성수역 근처 목적지
        ]
      }
    }
  }
];

export function useMapViewModel() {
  const [currentLocation, setCurrentLocation] = useState<NaverMapLocation>({
    lat: 37.5665,
    lng: 126.9780
  });

  const [map, setMap] = useState<NaverMapInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const polylinesRef = useRef<any[]>([]); // 폴리라인 참조 저장
  const markersRef = useRef<any[]>([]); // 마커 참조 저장

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

  // 기존 폴리라인과 마커 제거
  const clearPolylinesAndMarkers = useCallback(() => {
    // 기존 폴리라인 제거
    polylinesRef.current.forEach(polyline => {
      if (polyline && polyline.setMap) {
        polyline.setMap(null);
      }
    });
    polylinesRef.current = [];

    // 기존 마커 제거
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  // 폴리라인 그리기 함수
  const drawPolylines = useCallback((subPaths: DummySubPath[]) => {
    if (!map || !window.naver || !window.naver.maps) {
      console.error('지도가 초기화되지 않았습니다.');
      return;
    }

    // 기존 폴리라인과 마커 제거
    clearPolylinesAndMarkers();

    const naver = window.naver;
    const newPolylines: any[] = [];
    const newMarkers: any[] = [];

    // 각 subPath에 대해 폴리라인 생성
    subPaths.forEach((subPath, index) => {
      const coordinates = subPath.passShape.geojson.coordinates;
      const style = styleMap[subPath.trafficType as keyof typeof styleMap];

      // [lng, lat] → new naver.maps.LatLng(lat, lng) 변환
      const path = coordinates.map(coord => 
        new naver.maps.LatLng(coord[1], coord[0]) // [lng, lat] → [lat, lng]
      );

      // 폴리라인 생성
      const polyline = new naver.maps.Polyline({
        map: map,
        path: path,
        strokeColor: style.strokeColor,
        strokeWeight: style.strokeWeight,
        strokeStyle: style.strokeStyle as any
      });

      newPolylines.push(polyline);

      // 첫 번째 subPath의 첫 좌표를 출발 마커로 표시
      if (index === 0) {
        const startMarker = new naver.maps.Marker({
          position: new naver.maps.LatLng(coordinates[0][1], coordinates[0][0]),
          map: map,
          title: '출발지',
          icon: {
            content: '<div style="background: #00AA00; color: white; padding: 5px; border-radius: 50%; font-size: 12px; font-weight: bold;">출발</div>',
            size: new naver.maps.Size(40, 40),
            anchor: new naver.maps.Point(20, 20)
          }
        });
        newMarkers.push(startMarker);
      }

      // 마지막 subPath의 마지막 좌표를 도착 마커로 표시
      if (index === subPaths.length - 1) {
        const lastCoordinates = coordinates[coordinates.length - 1];
        const endMarker = new naver.maps.Marker({
          position: new naver.maps.LatLng(lastCoordinates[1], lastCoordinates[0]),
          map: map,
          title: '도착지',
          icon: {
            content: '<div style="background: #FF0000; color: white; padding: 5px; border-radius: 50%; font-size: 12px; font-weight: bold;">도착</div>',
            size: new naver.maps.Size(40, 40),
            anchor: new naver.maps.Point(20, 20)
          }
        });
        newMarkers.push(endMarker);
      }
    });

    // 참조 저장
    polylinesRef.current = newPolylines;
    markersRef.current = newMarkers;

    console.log('폴리라인 그리기 완료:', {
      polylines: newPolylines.length,
      markers: newMarkers.length
    });
  }, [map, clearPolylinesAndMarkers]);

  // 강남역 -> 성수역 더미 경로 그리기
  const drawGangnamToSeongsuRoute = useCallback(() => {
    drawPolylines(dummySubPath);
  }, [drawPolylines]);

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
    // 폴리라인과 마커 제거
    clearPolylinesAndMarkers();
    
    if (map) {
      map.destroy();
    }
  }, [map, clearPolylinesAndMarkers]);

  // 지도 위치 업데이트
  const updateMapLocation = useCallback((newLocation: NaverMapLocation) => {
    if (map && window.naver && window.naver.maps) {
      const newCenter = new window.naver.maps.LatLng(newLocation.lat, newLocation.lng);
      map.setCenter(newCenter as any);
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
    updateMapLocation,
    
    // Polyline Actions
    drawPolylines,
    drawGangnamToSeongsuRoute,
    clearPolylinesAndMarkers
  };
}

import { useRef, useCallback } from 'react';
import type { NaverMapInstance, NaverMarkerInstance } from '@/types/map';
import type { SimpleRoute } from '@/types/route-types';
import type { SubPath, Station } from '@/types/route-api-types';
import { MARKER_ICONS } from '../constants';
import { log } from '../utils/logger';

/**
 * 마커 관리를 담당하는 커스텀 훅
 * 마커 생성, 제거, 관리
 */
export function useMarker(map: NaverMapInstance | null) {
  const markersRef = useRef<NaverMarkerInstance[]>([]);

  // 기존 마커 제거
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  // 출발 마커 생성
  const createStartMarker = useCallback((lat: number, lng: number): NaverMarkerInstance | null => {
    if (!map || !window.naver || !window.naver.maps) {
      log.error('지도가 초기화되지 않았습니다.');
      return null;
    }

    const naver = window.naver;
    const startMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: map,
      title: '출발지',
      icon: {
        content: MARKER_ICONS.START.content,
        size: new naver.maps.Size(MARKER_ICONS.START.size.width, MARKER_ICONS.START.size.height),
        anchor: new naver.maps.Point(MARKER_ICONS.START.anchor.x, MARKER_ICONS.START.anchor.y)
      }
    });

    markersRef.current.push(startMarker);
    return startMarker;
  }, [map]);

  // 도착 마커 생성
  const createEndMarker = useCallback((lat: number, lng: number): NaverMarkerInstance | null => {
    if (!map || !window.naver || !window.naver.maps) {
      log.error('지도가 초기화되지 않았습니다.');
      return null;
    }

    const naver = window.naver;
    const endMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: map,
      title: '도착지',
      icon: {
        content: MARKER_ICONS.END.content,
        size: new naver.maps.Size(MARKER_ICONS.END.size.width, MARKER_ICONS.END.size.height),
        anchor: new naver.maps.Point(MARKER_ICONS.END.anchor.x, MARKER_ICONS.END.anchor.y)
      }
    });

    markersRef.current.push(endMarker);
    return endMarker;
  }, [map]);

  // 현재 위치 마커 생성 (빨간 점)
  const createCurrentLocationMarker = useCallback((lat: number, lng: number): NaverMarkerInstance | null => {
    if (!map || !window.naver || !window.naver.maps) {
      log.error('지도가 초기화되지 않았습니다.');
      return null;
    }

    const naver = window.naver;
    const currentLocationMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: map,
      title: '현재 위치',
      icon: {
        content: `<div style="
          width: 20px;
          height: 20px;
          background: #ff0000;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        size: new naver.maps.Size(20, 20),
        anchor: new naver.maps.Point(10, 10)
      }
    });

    markersRef.current.push(currentLocationMarker);
    return currentLocationMarker;
  }, [map]);

  // 지하철역 마커 생성
  const createStationMarker = useCallback((lat: number, lng: number, stationName: string): NaverMarkerInstance | null => {
    if (!map || !window.naver || !window.naver.maps) {
      log.error('지도가 초기화되지 않았습니다.');
      return null;
    }

    const naver = window.naver;
    const stationMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: map,
      title: stationName,
      icon: {
        content: `<div style="
          background: #0078ff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          white-space: nowrap;
        ">${stationName}</div>`,
        size: new naver.maps.Size(60, 30),
        anchor: new naver.maps.Point(30, 15)
      }
    });

    markersRef.current.push(stationMarker);
    return stationMarker;
  }, [map]);

  // 강남역 -> 공덕역 경로의 모든 지하철역 마커 생성
  const createGangnamToGongdeokStationMarkers = useCallback((): NaverMarkerInstance[] => {
    // 기존 마커 제거
    clearMarkers();

    const stations = [
      { name: '강남', lat: 37.497952, lng: 127.027619 },
      { name: '교대', lat: 37.493902, lng: 127.014395 },
      { name: '서초', lat: 37.491852, lng: 127.007702 },
      { name: '방배', lat: 37.481496, lng: 126.997667 },
      { name: '사당', lat: 37.476575, lng: 126.981363 },
      { name: '총신대입구(이수)', lat: 37.486803, lng: 126.982193 },
      { name: '동작', lat: 37.502915, lng: 126.980341 },
      { name: '이촌', lat: 37.522427, lng: 126.974396 },
      { name: '신용산', lat: 37.529241, lng: 126.967948 },
      { name: '삼각지', lat: 37.534547, lng: 126.972987 },
      { name: '효창공원앞', lat: 37.539274, lng: 126.961437 },
      { name: '공덕', lat: 37.543515, lng: 126.951969 }
    ];

    const stationMarkers: NaverMarkerInstance[] = [];
    
    stations.forEach(station => {
      const marker = createStationMarker(station.lat, station.lng, station.name);
      if (marker) {
        stationMarkers.push(marker);
      }
    });

    log.map('지하철역 마커 생성 완료', {
      stationCount: stationMarkers.length
    });

    return stationMarkers;
  }, [clearMarkers, createStationMarker]);

  // 선택된 경로의 마커 생성
  const createSelectedRouteMarkers = useCallback((route: SimpleRoute): NaverMarkerInstance[] => {
    // rawData 또는 polylineData 중 하나라도 있으면 처리
    const routeData = route.rawData || route.polylineData;
    if (!routeData) {
      log.error('경로 데이터가 없습니다.');
      return [];
    }

    // 기존 마커 제거
    clearMarkers();

    const stationMarkers: NaverMarkerInstance[] = [];
    const stationSet = new Set<string>(); // 중복 방지

    // JSON 데이터 형식 처리 (data 배열의 각 단계)
    if (routeData.data && Array.isArray(routeData.data)) {
      routeData.data.forEach((step: any) => {
        // 지하철 구간에서 역 정보 추출
        if (step.type === 'SUBWAY' && step.path && Array.isArray(step.path)) {
          step.path.forEach((station: any) => {
            if (station.lat && station.lng && station.name) {
              const stationKey = `${station.name}-${station.lat}-${station.lng}`;
              if (!stationSet.has(stationKey)) {
                stationSet.add(stationKey);
                const marker = createStationMarker(
                  station.lat,
                  station.lng,
                  station.name
                );
                if (marker) {
                  stationMarkers.push(marker);
                }
              }
            }
          });
        }
      });
    }
    // 기존 rawData 형식 처리
    else if (routeData.subPath && Array.isArray(routeData.subPath)) {
      routeData.subPath.forEach((subPath: SubPath) => {
        if (subPath.trafficType === 1 && subPath.passStopList?.stations) { // 지하철
          subPath.passStopList.stations.forEach((station: Station) => {
            const stationKey = `${station.stationName}-${station.x}-${station.y}`;
            if (!stationSet.has(stationKey)) {
              stationSet.add(stationKey);
              const marker = createStationMarker(
                parseFloat(station.y),
                parseFloat(station.x),
                station.stationName
              );
              if (marker) {
                stationMarkers.push(marker);
              }
            }
          });
        }
      });
    }

    log.map('선택된 경로 마커 생성 완료', {
      routeName: route.name,
      stationCount: stationMarkers.length
    });

    return stationMarkers;
  }, [clearMarkers, createStationMarker]);

  // 경로 마커들 생성 (출발지, 도착지)
  const createRouteMarkers = useCallback((startLat: number, startLng: number, endLat: number, endLng: number): { startMarker: NaverMarkerInstance | null; endMarker: NaverMarkerInstance | null } => {
    // 기존 마커 제거
    clearMarkers();

    // 출발 마커 생성
    const startMarker = createStartMarker(startLat, startLng);
    
    // 도착 마커 생성
    const endMarker = createEndMarker(endLat, endLng);

    log.map('경로 마커 생성 완료', {
      startMarker: !!startMarker,
      endMarker: !!endMarker
    });

    return { startMarker, endMarker };
  }, [clearMarkers, createStartMarker, createEndMarker]);

  return {
    clearMarkers,
    createStartMarker,
    createEndMarker,
    createCurrentLocationMarker,
    createStationMarker,
    createGangnamToGongdeokStationMarkers,
    createSelectedRouteMarkers,
    createRouteMarkers
  };
}

import { useRef, useCallback } from 'react';
import type { NaverMapInstance } from '../../types/map';
import { MARKER_ICONS } from '../../utils/constants';

/**
 * 마커 관리를 담당하는 커스텀 훅
 * 마커 생성, 제거, 관리
 */
export function useMarker(map: NaverMapInstance | null) {
  const markersRef = useRef<any[]>([]);

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
  const createStartMarker = useCallback((lat: number, lng: number) => {
    if (!map || !window.naver || !window.naver.maps) {
      console.error('지도가 초기화되지 않았습니다.');
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
  const createEndMarker = useCallback((lat: number, lng: number) => {
    if (!map || !window.naver || !window.naver.maps) {
      console.error('지도가 초기화되지 않았습니다.');
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

  // 경로 마커들 생성 (출발지, 도착지)
  const createRouteMarkers = useCallback((startLat: number, startLng: number, endLat: number, endLng: number) => {
    // 기존 마커 제거
    clearMarkers();

    // 출발 마커 생성
    const startMarker = createStartMarker(startLat, startLng);
    
    // 도착 마커 생성
    const endMarker = createEndMarker(endLat, endLng);

    console.log('경로 마커 생성 완료:', {
      startMarker: !!startMarker,
      endMarker: !!endMarker
    });

    return { startMarker, endMarker };
  }, [clearMarkers, createStartMarker, createEndMarker]);

  return {
    clearMarkers,
    createStartMarker,
    createEndMarker,
    createRouteMarkers
  };
}

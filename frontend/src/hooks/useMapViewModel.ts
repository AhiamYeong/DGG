import { useEffect, useCallback } from 'react';
import { useMapInitialization, useMapLocation, usePolyline, useMarker } from './map';
import type { NaverMapLocation } from '../types/map';

/**
 * 새로운 useMapViewModel - 기능별 훅들을 조합한 메인 훅
 * 기존 330+ 라인을 여러 개의 작은 훅으로 분리
 */
export function useMapViewModel() {
  // 지도 초기화
  const { map, isLoaded, mapRef, initializeMap, cleanupMap } = useMapInitialization();
  
  // 위치 관리
  const { currentLocation, setCurrentLocation, getCurrentLocation, updateMapLocation, centerMapToRouteStart } = useMapLocation();
  
  // 폴리라인 관리
  const { drawPolylines, drawGangnamToGongdeokRoute, drawSelectedRoute, clearPolylines } = usePolyline(map);
  
  // 마커 관리
  const { clearMarkers, createRouteMarkers, createCurrentLocationMarker, createGangnamToGongdeokStationMarkers, createSelectedRouteMarkers } = useMarker(map);
  
  // 검색 기능은 useRouteSearchStore에서 처리

  // 폴리라인과 마커를 함께 제거하는 함수
  const clearPolylinesAndMarkers = useCallback(() => {
    clearPolylines();
    clearMarkers();
  }, [clearPolylines, clearMarkers]);

  // 지도 이동 함수
  const moveMapToLocation = useCallback((lat: number, lng: number) => {
    if (!map) return;
    
    const naver = window.naver;
    const newCenter = new naver.maps.LatLng(lat, lng);
    map.setCenter(newCenter);
    map.setZoom(16);
  }, [map]);

  // currentLocation이 변경될 때 지도 위치 업데이트
  useEffect(() => {
    if (map && isLoaded) {
      updateMapLocation(currentLocation, map);
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
    initializeMap,
    cleanupMap,
    setCurrentLocation,
    updateMapLocation: (newLocation: NaverMapLocation) => updateMapLocation(newLocation, map),
    centerMapToRouteStart: (route: any) => centerMapToRouteStart(route, map),
    
    // Polyline Actions
    drawPolylines,
    drawGangnamToGongdeokRoute,
    drawSelectedRoute,
    clearPolylinesAndMarkers,
    
    // Marker Actions
    createRouteMarkers,
    createCurrentLocationMarker,
    createGangnamToGongdeokStationMarkers,
    createSelectedRouteMarkers,
    
    // Map Movement
    moveMapToLocation
  };
}

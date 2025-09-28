import { useCallback, useEffect } from 'react';
import { useMapViewModel } from '../hooks/useMapViewModel';
import { useRouteSearchStore } from '../stores/useRouteSearchStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { MapContainer } from '../components/map';
import { NavigationMode, SearchMode } from '../components/navigation';
import { MAP_DEFAULTS } from '../constants';
import type { PlaceInfo } from '../types/route-types';

export default function MainMapPage() {
  // 지도 관련 로직
  const {
    currentLocation,
    mapRef,
    isLoaded,
    getCurrentLocation,
    initializeMap,
    cleanupMap,
    createCurrentLocationMarker,
    drawSelectedRoute,
    createSelectedRouteMarkers,
    centerMapToRouteStart
  } = useMapViewModel();

  // 경로 검색 관련 상태 및 액션 (스토어에서 직접 사용)
  const {
    routeResults,
    actionLabel,
    currentOrigin,
    currentDestination,
    startRouteSearch,
    closeRouteResults,
    selectRoute
  } = useRouteSearchStore();

  // 네비게이션 관련 상태 및 액션
  const {
    isNavigating,
    currentRoute,
    sideSheetPosition,
    currentStepIndex,
    closeSideSheet,
    setSideSheetPosition,
    stopNavigation
  } = useNavigationStore();


  // 현재 위치 버튼 클릭 핸들러
  const handleLocationClick = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleRouteSearch = useCallback((origin: PlaceInfo, destination: PlaceInfo, waypoints?: PlaceInfo[], departureTime?: string) => {
    // 통합된 주소 정보를 전역 상태에 저장
    startRouteSearch(origin, destination, waypoints, departureTime);
  }, [startRouteSearch]);

  // 현재 위치가 변경될 때 마커 표시
  useEffect(() => {
    if (currentLocation && currentLocation.lat !== MAP_DEFAULTS.DEFAULT_CENTER.lat && currentLocation.lng !== MAP_DEFAULTS.DEFAULT_CENTER.lng) {
      createCurrentLocationMarker(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation, createCurrentLocationMarker]);

  // 네비게이션 시작 시 선택된 경로의 폴리라인과 마커 그리기
  useEffect(() => {
    if (isNavigating && currentRoute && (currentRoute.rawData || currentRoute.polylineData)) {
      drawSelectedRoute(currentRoute);
      createSelectedRouteMarkers(currentRoute);
      // 지도를 경로 시작점으로 이동
      centerMapToRouteStart(currentRoute);
    }
  }, [isNavigating, currentRoute, drawSelectedRoute, createSelectedRouteMarkers, centerMapToRouteStart]);


  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 레이어 0: 지도 컨테이너 */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          currentLocation={currentLocation}
          mapRef={mapRef}
          isLoaded={isLoaded}
          onInitialize={initializeMap}
          onCleanup={cleanupMap}
        />
      </div>

      {/* 레이어 1: 네비게이션 모드 또는 검색 모드 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {isNavigating && currentRoute ? (
          <NavigationMode
            currentRoute={currentRoute}
            currentStepIndex={currentStepIndex}
            sideSheetPosition={sideSheetPosition}
            onPositionChange={setSideSheetPosition}
            onClose={closeSideSheet}
            onStopNavigation={stopNavigation}
          />
        ) : (
          <SearchMode
            onSearch={handleRouteSearch}
            routeResults={routeResults}
            actionLabel={actionLabel}
            onSelectRoute={selectRoute}
            onCloseRouteResults={closeRouteResults}
            onLocationClick={handleLocationClick}
            currentOrigin={currentOrigin}
            currentDestination={currentDestination}
          />
        )}
      </div>

    </div>
  );
}

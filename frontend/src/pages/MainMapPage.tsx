import { useCallback, useEffect } from 'react';
import { useMapViewModel } from '../hooks/useMapViewModel';
import { useRouteSearchStore } from '../stores/useRouteSearchStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { MapContainer } from '../components/map';
import { NavigationMode, SearchMode } from '../components/navigation';
import { TimePicker } from '../components/ui';
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
    drawDetailedRoute,
    createSelectedRouteMarkers,
    centerMapToRouteStart
  } = useMapViewModel();

  // 경로 검색 관련 상태 및 액션 (스토어에서 직접 사용)
  const {
    routeResults,
    actionLabel,
    showDepartureOptions,
    currentOrigin,
    currentDestination,
    showTimePicker,
    departureTime,
    selectedDepartureOption,
    startRouteSearch,
    confirmTimeSelection,
    cancelTimeSelection,
    closeRouteResults,
    setDepartureTime,
    setSelectedDepartureOption,
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

  // 출발 옵션 탭 닫기 핸들러 (메모이제이션)
  const handleCloseDepartureOptions = useCallback(() => {
    closeRouteResults();
  }, [closeRouteResults]);

  // 현재 위치 버튼 클릭 핸들러
  const handleLocationClick = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleRouteSearch = useCallback((origin: PlaceInfo, destination: PlaceInfo, waypoints?: PlaceInfo[]) => {
    // 통합된 주소 정보를 전역 상태에 저장
    startRouteSearch(origin, destination, waypoints);
  }, [startRouteSearch]);

  // 지도 로드 시 내 위치로 이동
  useEffect(() => {
    if (isLoaded) {
      console.log('지도 로드 완료 - 내 위치로 이동');
      getCurrentLocation();
    }
  }, [isLoaded, getCurrentLocation]);

  // 현재 위치가 변경될 때 마커 표시
  useEffect(() => {
    if (currentLocation && currentLocation.lat !== MAP_DEFAULTS.DEFAULT_CENTER.lat && currentLocation.lng !== MAP_DEFAULTS.DEFAULT_CENTER.lng) {
      createCurrentLocationMarker(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation, createCurrentLocationMarker]);

  // 네비게이션 시작 시 선택된 경로의 폴리라인과 마커 그리기
  useEffect(() => {
    console.log('네비게이션 useEffect 트리거:', { isNavigating, currentRoute: !!currentRoute, hasSteps: !!currentRoute?.steps });
    
    if (isNavigating && currentRoute) {
      console.log('네비게이션 시작 - 경로 처리 시작');
      
      // 상세 경로 데이터가 있으면 상세 폴리라인 그리기
      if (currentRoute.steps && currentRoute.steps.length > 0) {
        console.log('상세 경로 데이터로 폴리라인 그리기');
        const routeDetail = {
          data: currentRoute.steps.map((step: any) => ({
            type: step.type === 'walk' ? 'WALKING' : step.type === 'subway' ? 'SUBWAY' : step.type === 'bus' ? 'BUS' : 'WALKING',
            lineName: step.lineInfo?.name,
            startPoint: step.startName,
            endPoint: step.endName,
            startLat: step.startLocation?.latitude,
            startLng: step.startLocation?.longitude,
            endLat: step.endLocation?.latitude,
            endLng: step.endLocation?.longitude,
            timeTaken: step.duration,
            path: step.path || null // path 데이터 포함
          }))
        };
        drawDetailedRoute(routeDetail);
      } else if (currentRoute.rawData) {
        console.log('기존 rawData로 폴리라인 그리기');
        drawSelectedRoute(currentRoute);
      }
      
      createSelectedRouteMarkers(currentRoute);
      // 지도를 경로 시작점으로 이동
      console.log('지도 중심 이동 호출');
      centerMapToRouteStart(currentRoute);
    }
  }, [isNavigating, currentRoute, drawSelectedRoute, drawDetailedRoute, createSelectedRouteMarkers, centerMapToRouteStart]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 레이어 0: 지도 컨테이너 */}
      <div 
        className="absolute inset-0 z-0 pointer-events-auto"
        onClick={() => console.log('🗺️ 지도 컨테이너 터치됨!')}
        onTouchStart={() => console.log('🗺️ 지도 컨테이너 터치 시작!')}
      >
        <MapContainer
          currentLocation={currentLocation}
          mapRef={mapRef}
          isLoaded={isLoaded}
          onInitialize={initializeMap}
          onCleanup={cleanupMap}
        />
      </div>

      {/* 레이어 1: 네비게이션 모드 또는 검색 모드 */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        onClick={() => console.log('🎯 네비게이션 모드 컨테이너 터치됨!')}
        onTouchStart={() => console.log('🎯 네비게이션 모드 컨테이너 터치 시작!')}
      >
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
            onDepartureOptionChange={setSelectedDepartureOption}
            selectedDepartureOption={selectedDepartureOption}
            showDepartureOptions={showDepartureOptions}
            onCloseDepartureOptions={handleCloseDepartureOptions}
            routeResults={routeResults}
            actionLabel={actionLabel}
            onSelectRoute={selectRoute}
            onCloseRouteResults={closeRouteResults}
            showTimePicker={showTimePicker}
            onLocationClick={handleLocationClick}
            currentOrigin={currentOrigin}
            currentDestination={currentDestination}
          />
        )}
      </div>

      {/* 타임픽커 모달 - pointer-events-none 영향 받지 않도록 별도 레이어 */}
      <TimePicker
        isOpen={showTimePicker}
        departureTime={departureTime}
        onTimeChange={setDepartureTime}
        onConfirm={confirmTimeSelection}
        onCancel={cancelTimeSelection}
      />
    </div>
  );
}

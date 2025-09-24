import { useCallback, useEffect } from 'react';
import { useMapViewModel } from '../hooks/useMapViewModel';
import { useRouteSearchStore } from '../stores/useRouteSearchStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { MapContainer } from '../components/map';
import { NavigationMode, SearchMode } from '../components/navigation';
import { TimePicker } from '../components/ui';
import AlarmEditModal from '@/components/AlarmEditModal';
import { useState } from 'react';
import type { AlarmProps } from '@/api/alarmApi';
import { MAP_DEFAULTS } from '../constants';
import type { PlaceInfo } from '../types/route-types';

export default function MainMapPage() {
  // 예약하기(출발예약) 시 알람 모달 재사용
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [tempAlarm, setTempAlarm] = useState<AlarmProps | null>(null);
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

  // 현재 위치가 변경될 때 마커 표시
  useEffect(() => {
    if (currentLocation && currentLocation.lat !== MAP_DEFAULTS.DEFAULT_CENTER.lat && currentLocation.lng !== MAP_DEFAULTS.DEFAULT_CENTER.lng) {
      createCurrentLocationMarker(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation, createCurrentLocationMarker]);

  // 네비게이션 시작 시 선택된 경로의 폴리라인과 마커 그리기
  useEffect(() => {
    console.log('네비게이션 useEffect 트리거:', { 
      isNavigating, 
      currentRoute: !!currentRoute, 
      hasRawData: !!currentRoute?.rawData,
      hasPolylineData: !!currentRoute?.polylineData 
    });
    
    if (isNavigating && currentRoute && (currentRoute.rawData || currentRoute.polylineData)) {
      console.log('네비게이션 시작 - 경로 처리 시작');
      drawSelectedRoute(currentRoute);
      createSelectedRouteMarkers(currentRoute);
      // 지도를 경로 시작점으로 이동
      console.log('지도 중심 이동 호출');
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
            onDepartureOptionChange={(option) => {
              // 시간 조정(타임픽커) 이후에만 모달을 띄우도록 변경
              setSelectedDepartureOption(option);
            }}
            selectedDepartureOption={selectedDepartureOption}
            showDepartureOptions={showDepartureOptions}
            onCloseDepartureOptions={handleCloseDepartureOptions}
            routeResults={routeResults}
            actionLabel={actionLabel}
            onSelectRoute={async (route) => {
              // actionLabel은 스토어에서 시간/옵션에 따라 '안내 시작' 또는 '경로 예약'으로 내려줌
              if (actionLabel === '경로 예약' && currentOrigin && currentDestination) {
                const mockAlarm: AlarmProps = {
                  alarmId: -1,
                  eventId: -1,
                  title: '경로 출발 예약',
                  eventTitle: `${currentOrigin.name} → ${currentDestination.name}`,
                  departure: currentOrigin.name,
                  destination: currentDestination.name,
                  departureTime: departureTime.toLocaleString('ko-KR', { hour12: false }),
                  enabled: true,
                  offsetMinutes: 10,
                };
                setTempAlarm(mockAlarm);
                setShowReserveModal(true);
                return;
              }
              await selectRoute(route);
            }}
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
        onConfirm={async () => {
          // 경로 검색 확정 먼저 처리
          await confirmTimeSelection();
        }}
        onCancel={cancelTimeSelection}
      />

      {/* 예약하기 - AlarmPage와 동일 모달 재사용 */}
      {showReserveModal && tempAlarm && (
        <AlarmEditModal
          alarm={tempAlarm}
          onClose={() => setShowReserveModal(false)}
          onSave={() => setShowReserveModal(false)}
        />
      )}
    </div>
  );
}

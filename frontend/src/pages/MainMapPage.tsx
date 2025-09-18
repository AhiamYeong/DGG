import { useCallback } from 'react';
import { useMapViewModel } from '../hooks/useMapViewModel';
import { useRouteSearchStore } from '../stores/useRouteSearchStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { MapContainer } from '../components/map';
import { NavigationMode, SearchMode } from '../components/navigation';
import { TimePicker } from '../components/ui';

export default function MainMapPage() {
  // 지도 관련 로직
  const {
    currentLocation,
    mapRef,
    isLoaded,
    getCurrentLocation,
    initializeMap,
    cleanupMap,
    drawGangnamToSeongsuRoute,
    clearPolylinesAndMarkers
  } = useMapViewModel();

  // 경로 검색 관련 상태 및 액션 (스토어에서 직접 사용)
  const {
    routeResults,
    actionLabel,
    showDepartureOptions,
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
            onSearch={startRouteSearch}
            onDepartureOptionChange={setSelectedDepartureOption}
            selectedDepartureOption={selectedDepartureOption}
            showDepartureOptions={showDepartureOptions}
            onCloseDepartureOptions={handleCloseDepartureOptions}
            routeResults={routeResults}
            actionLabel={actionLabel}
            onSelectRoute={selectRoute}
            onCloseRouteResults={closeRouteResults}
            showTimePicker={showTimePicker}
            onLocationClick={getCurrentLocation}
            onPolylineClick={drawGangnamToSeongsuRoute}
            onRemoveClick={clearPolylinesAndMarkers}
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

import { useCallback } from 'react';
import { useMapViewModel } from '../hooks/useMapViewModel';
import { useRouteSearchStore } from '../stores/useRouteSearchStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { MapContainer } from '../components/map';
import { NavigationMode, SearchMode } from '../components/navigation';
import { MapLayout, LayerContainer } from '../components/layout';

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
    <MapLayout>
      {/* 레이어 0: 지도 컨테이너 */}
      <LayerContainer zIndex={0}>
        <MapContainer
          currentLocation={currentLocation}
          mapRef={mapRef}
          isLoaded={isLoaded}
          onInitialize={initializeMap}
          onCleanup={cleanupMap}
        />
      </LayerContainer>

      {/* 레이어 1: 네비게이션 모드 또는 검색 모드 */}
      <LayerContainer zIndex={10} pointerEvents="auto">
        {isNavigating && currentRoute ? (
          <NavigationMode
            currentRoute={currentRoute}
            currentStepIndex={currentStepIndex}
            sideSheetPosition={sideSheetPosition}
            onPositionChange={setSideSheetPosition}
            onClose={closeSideSheet}
            onStopNavigation={stopNavigation}
            headerHeight={140}
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
            onToggleBookmark={() => {}}
            onShowOptions={() => {}}
            onCloseRouteResults={closeRouteResults}
            showTimePicker={showTimePicker}
            departureTime={departureTime}
            onTimeChange={setDepartureTime}
            onConfirmTime={confirmTimeSelection}
            onCancelTime={cancelTimeSelection}
            onLocationClick={getCurrentLocation}
            onPolylineClick={drawGangnamToSeongsuRoute}
            onRemoveClick={clearPolylinesAndMarkers}
          />
        )}
      </LayerContainer>
    </MapLayout>
  );
}

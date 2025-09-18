import { useMapViewModel } from '../hooks/useMapViewModel';
import { useRouteSearchStore } from '../stores/useRouteSearchStore';
import SearchBox from '../components/functional/SearchBox';
import TimePicker from '../components/functional/TimePicker';
import RouteResults from '../components/functional/RouteResults';
import FavoriteRoutesBottomSheet from '../components/functional/Route/FavoriteRoutesBottomSheet';
import NaverMap from '../components/functional/NaverMap';

export default function MainMapPage() {
  // 지도 관련 로직
  const {
    currentLocation,
    mapRef,
    isLoaded,
    getCurrentLocation,
    initializeMap,
    cleanupMap
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

  // 출발 옵션 탭 닫기 핸들러
  const handleCloseDepartureOptions = () => {
    closeRouteResults();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 레이어 1: 네이버 지도 (전체 화면) */}
      <div className="absolute inset-0 z-0">
        <NaverMap 
          center={currentLocation}
          height="100vh"
          width="100%"
          mapRef={mapRef}
          isLoaded={isLoaded}
          onInitialize={initializeMap}
          onCleanup={cleanupMap}
        />
      </div>

      {/* 레이어 2: UI 컴포넌트들 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* 상단 검색 박스 */}
        <div className="absolute top-0 left-0 right-0 pointer-events-auto">
          <SearchBox 
            onSearch={startRouteSearch}
            onDepartureOptionChange={setSelectedDepartureOption}
            selectedDepartureOption={selectedDepartureOption}
            showDepartureOptions={false}
            onCloseDepartureOptions={handleCloseDepartureOptions}
          />
        </div>

        {/* 경로 결과 컴포넌트 */}
        <RouteResults
          isOpen={showDepartureOptions}
          routes={routeResults}
          actionLabel={actionLabel}
          selectedDepartureOption={selectedDepartureOption}
          onSelectRoute={selectRoute}
          onToggleBookmark={() => {}}
          onShowOptions={() => {}}
          onDepartureOptionChange={setSelectedDepartureOption}
          onClose={closeRouteResults}
        />

        {/* 현재 위치 버튼 (우측 하단) */}
        <div className="absolute bottom-32 right-4 pointer-events-auto">
          <button
            onClick={getCurrentLocation}
            className="bg-white hover:bg-secondary hover:bg-opacity-20 text-font p-3 rounded-full shadow-lg transition-colors"
            title="현재 위치로 이동"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 타임픽커 모달 - pointer-events-none 컨테이너 밖으로 이동 */}
      <TimePicker
        isOpen={showTimePicker}
        departureTime={departureTime}
        onTimeChange={setDepartureTime}
        onConfirm={confirmTimeSelection}
        onCancel={cancelTimeSelection}
      />

      {/* 하단 즐겨찾기 예약노선 바텀시트 - 처음 지도 화면에서만 표시 */}
      {routeResults.length === 0 && !showTimePicker && !showDepartureOptions && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <FavoriteRoutesBottomSheet />
        </div>
      )}
    </div>
  );
}

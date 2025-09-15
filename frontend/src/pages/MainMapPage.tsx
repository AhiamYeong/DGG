import { useMapViewModel } from '../hooks/useMapViewModel';
import SearchBox from '../components/functional/SearchBox';
import FavoriteRoutesBottomSheet from '../components/functional/Route/FavoriteRoutesBottomSheet';
import NaverMap from '../components/functional/NaverMap';

export default function MainMapPage() {
  const {
    currentLocation,
    mapRef,
    isLoaded,
    getCurrentLocation,
    handleSearch,
    initializeMap,
    cleanupMap
  } = useMapViewModel();

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
        {/* 상단 검색 박스 - 전체 화면을 가림 */}
        <div className="absolute top-0 left-0 right-0 pointer-events-auto">
          <SearchBox onSearch={handleSearch} />
        </div>

        {/* 하단 즐겨찾기 예약노선 바텀시트 */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
          <FavoriteRoutesBottomSheet />
        </div>

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
    </div>
  );
}

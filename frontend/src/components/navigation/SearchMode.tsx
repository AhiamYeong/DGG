import { memo } from 'react';
import SearchBox from '../functional/SearchBox';
import RouteResultsContainer from '../functional/RouteResults';
import FavoriteRoutesBottomSheet from '../functional/Route/FavoriteRoutesBottomSheet';
import { MapControls } from '../ui';
import type { SimpleRoute } from '../../types/route-types';

interface SearchModeProps {
  // 검색 관련 props
  onSearch: (origin: string, destination: string, waypoints?: string[]) => void;
  onDepartureOptionChange: (option: 'now' | 'schedule') => void;
  selectedDepartureOption: 'now' | 'schedule';
  showDepartureOptions: boolean;
  onCloseDepartureOptions: () => void;
  
  // 경로 결과 관련 props
  routeResults: SimpleRoute[];
  actionLabel: string;
  onSelectRoute: (route: SimpleRoute) => void;
  onToggleBookmark: (routeId: string) => void;
  onShowOptions: (routeId: string) => void;
  onCloseRouteResults: () => void;
  
  // 시간 선택 관련 props
  showTimePicker: boolean;
  
  // 지도 컨트롤 관련 props
  onLocationClick: () => void;
  onPolylineClick: () => void;
  onRemoveClick: () => void;
}

/**
 * 검색 모드 컴포넌트
 * 일반적인 검색 및 경로 선택 UI를 제공
 * React.memo로 불필요한 리렌더링 방지
 */
export const SearchMode = memo<SearchModeProps>(({
  onSearch,
  onDepartureOptionChange,
  selectedDepartureOption,
  showDepartureOptions,
  onCloseDepartureOptions,
  routeResults,
  actionLabel,
  onSelectRoute,
  onToggleBookmark,
  onShowOptions,
  onCloseRouteResults,
  showTimePicker,
  onLocationClick,
  onPolylineClick,
  onRemoveClick
}) => {
  return (
    <>
      {/* 상단 검색 박스 */}
      <div className="absolute top-0 left-0 w-full">
        <div className="pointer-events-auto">
          <SearchBox 
            onSearch={onSearch}
            onDepartureOptionChange={onDepartureOptionChange}
            selectedDepartureOption={selectedDepartureOption}
            showDepartureOptions={false}
            onCloseDepartureOptions={onCloseDepartureOptions}
          />
        </div>
      </div>

      {/* 경로 결과 컴포넌트 */}
      <RouteResultsContainer
        isOpen={showDepartureOptions}
        routes={routeResults}
        actionLabel={actionLabel}
        selectedDepartureOption={selectedDepartureOption}
        onSelectRoute={onSelectRoute}
        onToggleBookmark={onToggleBookmark}
        onShowOptions={onShowOptions}
        onDepartureOptionChange={onDepartureOptionChange}
        onClose={onCloseRouteResults}
      />

      {/* 지도 컨트롤 버튼들 */}
      <div className="absolute bottom-0 right-0 ml-4 mt-32">
        <div className="pointer-events-auto">
          <MapControls
            onLocationClick={onLocationClick}
            onPolylineClick={onPolylineClick}
            onRemoveClick={onRemoveClick}
            position="bottom-right"
          />
        </div>
      </div>


      {/* 하단 즐겨찾기 예약노선 바텀시트 - 처음 지도 화면에서만 표시 */}
      {routeResults.length === 0 && !showTimePicker && !showDepartureOptions && (
        <div className="absolute bottom-0 left-0 w-full pointer-events-auto" style={{ zIndex: 20 }}>
          <FavoriteRoutesBottomSheet />
        </div>
      )}
    </>
  );
});

export default SearchMode;

import { memo } from 'react';
import { SearchBox } from '../search';
import { RouteResultsContainer } from '../route';
import { FavoriteRoutesBottomSheet } from '../route';
import { MapControls } from '../map';
import type { SimpleRoute, PlaceInfo } from '../../types/route-types';

interface SearchModeProps {
  // 검색 관련 props
  onSearch: (origin: PlaceInfo, destination: PlaceInfo, waypoints?: PlaceInfo[], departureTime?: string) => void;
  
  // 경로 결과 관련 props
  routeResults: SimpleRoute[];
  actionLabel: string;
  onSelectRoute: (route: SimpleRoute) => Promise<void>;
  onCloseRouteResults: () => void;
  
  // 지도 컨트롤 관련 props
  onLocationClick: () => void;
  
  // 현재 검색 중인 출발지/도착지
  currentOrigin: PlaceInfo | null;
  currentDestination: PlaceInfo | null;
}

/**
 * 검색 모드 컴포넌트
 * 일반적인 검색 및 경로 선택 UI를 제공
 * React.memo로 불필요한 리렌더링 방지
 */
export const SearchMode = memo<SearchModeProps>(({
  onSearch,
  routeResults,
  actionLabel,
  onSelectRoute,
  onCloseRouteResults,
  onLocationClick,
  currentOrigin,
  currentDestination
}) => {
  return (
    <>
      {/* 상단 검색 박스 */}
      <div className="absolute top-0 left-0 w-full pointer-events-auto">
        <SearchBox 
          onSearch={onSearch}
        />
      </div>

      {/* 경로 결과 컴포넌트 */}
      <RouteResultsContainer
        isOpen={routeResults.length > 0}
        routes={routeResults}
        actionLabel={actionLabel}
        onSelectRoute={onSelectRoute}
        onClose={onCloseRouteResults}
        currentOrigin={currentOrigin?.name}
        currentDestination={currentDestination?.name}
      />

      {/* 지도 컨트롤 버튼들 */}
      <div className="absolute bottom-0 right-0 ml-4 mt-32 pointer-events-auto">
        <MapControls
          onLocationClick={onLocationClick}
          position="bottom-right"
        />
      </div>


      {/* 하단 즐겨찾기 예약노선 바텀시트 - 처음 지도 화면에서만 표시 */}
      {routeResults.length === 0 && (
        <div className="absolute bottom-0 left-0 w-full pointer-events-auto" style={{ zIndex: 20 }}>
          <FavoriteRoutesBottomSheet />
        </div>
      )}
    </>
  );
});

export default SearchMode;

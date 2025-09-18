import { useEffect } from 'react';
import { useSearchStore } from '../../stores/useSearchStore';
import { IconButton } from '../ui';
import SearchInput from './SearchInput';
import WaypointInput from './WaypointInput';
import { ROUTE_CONSTANTS } from '../../constants';

interface SearchBoxProps {
  onSearch: (origin: string, destination: string, waypoints?: string[]) => void;
  onDepartureOptionChange?: (option: 'now' | 'schedule') => void;
  selectedDepartureOption?: 'now' | 'schedule';
  showDepartureOptions?: boolean;
  onCloseDepartureOptions?: () => void;
}

export default function SearchBox({ onSearch, onDepartureOptionChange, selectedDepartureOption = 'now', showDepartureOptions = false, onCloseDepartureOptions }: SearchBoxProps) {
  const {
    origin,
    destination,
    waypoints,
    originRoadAddress,
    destinationRoadAddress,
    setOrigin,
    setDestination,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    clearOrigin,
    clearDestination,
    clearWaypoint
  } = useSearchStore();

  // 컴포넌트 마운트 시 상태 로깅
  useEffect(() => {
    console.log('SearchBox 마운트 - 현재 상태:', { origin, destination });
  }, [origin, destination]);

  const handleSearch = () => {
    if (origin.trim() && destination.trim()) {
      // 도로명 주소가 있으면 도로명 주소를 사용, 없으면 장소명 사용
      const departureAddress = originRoadAddress || origin.trim();
      const destinationAddress = destinationRoadAddress || destination.trim();
      const waypointAddresses = waypoints
        .map(wp => wp.roadAddress || wp.value.trim())
        .filter(address => address);
      
      onSearch(departureAddress, destinationAddress, waypointAddresses);
    }
  };

  const handleDepartureOptionChange = (option: 'now' | 'schedule') => {
    onDepartureOptionChange?.(option);
  };

  return (
    <div className="w-full bg-white shadow-lg">
      {/* 상단 여백 */}
      <div className="h-4"></div>
      
      {/* 3구역 레이아웃 */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          {/* 왼쪽 구역: 경유지 추가 버튼 */}
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={addWaypoint}
              disabled={waypoints.length >= ROUTE_CONSTANTS.MAX_WAYPOINTS}
              className={`
                w-12 h-12 bg-white border-2 rounded-full flex items-center justify-center transition-colors
                ${waypoints.length >= ROUTE_CONSTANTS.MAX_WAYPOINTS 
                  ? 'border-secondary text-secondary cursor-not-allowed' 
                  : 'border-primary text-primary hover:border-primary hover:bg-primary hover:text-white'
                }
              `}
              title={waypoints.length >= ROUTE_CONSTANTS.MAX_WAYPOINTS ? `최대 ${ROUTE_CONSTANTS.MAX_WAYPOINTS}개까지 추가 가능` : "경유지 추가"}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* 가운데 구역: 출발지/경유지/도착지 입력 */}
          <div className="flex-1 space-y-2">
            {/* 출발지 입력 */}
            <SearchInput
              value={origin}
              onChange={setOrigin}
              placeholder="출발지 검색"
              onClear={clearOrigin}
              icon="search"
              searchType="origin"
            />

            {/* 경유지 입력들 */}
            {waypoints.map((waypoint, index) => (
              <WaypointInput
                key={waypoint.id}
                waypoint={waypoint}
                index={index}
                onValueChange={updateWaypoint}
                onRemove={removeWaypoint}
                onClear={clearWaypoint}
              />
            ))}

            {/* 도착지 입력 */}
            <SearchInput
              value={destination}
              onChange={setDestination}
              placeholder="도착지 검색"
              onClear={clearDestination}
              icon="search"
              searchType="destination"
            />
          </div>

          {/* 오른쪽 구역: 검색 버튼 */}
          <div className="flex-shrink-0">
            <IconButton
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              onClick={handleSearch}
              disabled={!origin.trim() || !destination.trim()}
              className="w-12 h-12 bg-primary text-white rounded-full hover:opacity-90 disabled:bg-secondary disabled:cursor-not-allowed transition-opacity"
              aria-label="길찾기"
            />
          </div>
        </div>

        {/* 출발 옵션 탭 - 검색 버튼을 누른 후에만 표시 */}
        {showDepartureOptions && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleDepartureOptionChange('now')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedDepartureOption === 'now'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm font-medium">지금 출발하기</span>
            </button>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>

            <button
              type="button"
              onClick={() => handleDepartureOptionChange('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedDepartureOption === 'schedule'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm font-medium">
                출발예약 {new Date().toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </button>

            {/* X 버튼 */}
            {onCloseDepartureOptions && (
              <IconButton
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
                onClick={onCloseDepartureOptions}
                className="text-gray-500 hover:text-gray-700"
                aria-label="닫기"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

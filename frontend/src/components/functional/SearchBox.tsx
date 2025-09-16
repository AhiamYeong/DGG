import { useSearchStore } from '../../stores/useSearchStore';
import SearchInputField from './SearchInputField';
import WaypointInput from './WaypointInput';

interface SearchBoxProps {
  onSearch: (origin: string, destination: string, waypoints?: string[]) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const {
    origin,
    destination,
    waypoints,
    setOrigin,
    setDestination,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    clearOrigin,
    clearDestination,
    clearWaypoint
  } = useSearchStore();

  const handleSearch = () => {
    if (origin.trim() && destination.trim()) {
      const waypointValues = waypoints.map(wp => wp.value.trim()).filter(value => value);
      onSearch(origin.trim(), destination.trim(), waypointValues);
    }
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
              disabled={waypoints.length >= 5}
              className={`w-12 h-12 bg-white border-2 rounded-full flex items-center justify-center transition-colors ${
                waypoints.length >= 5 
                  ? 'border-secondary text-secondary cursor-not-allowed' 
                  : 'border-primary text-primary hover:border-primary hover:bg-primary hover:text-white'
              }`}
              title={waypoints.length >= 5 ? "최대 5개까지 추가 가능" : "경유지 추가"}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* 가운데 구역: 출발지/경유지/도착지 입력 */}
          <div className="flex-1 space-y-2">
            {/* 출발지 입력 */}
            <SearchInputField
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
            <SearchInputField
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
            <button
              type="button"
              onClick={handleSearch}
              disabled={!origin.trim() || !destination.trim()}
              className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 disabled:bg-secondary disabled:cursor-not-allowed transition-opacity"
              title="길찾기"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

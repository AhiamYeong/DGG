import { useNavigate } from 'react-router-dom';

interface Waypoint {
  id: string;
  value: string;
}

interface WaypointInputProps {
  waypoint: Waypoint;
  index: number;
  onValueChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onClear: (id: string) => void;
}

export default function WaypointInput({
  waypoint,
  index,
  onValueChange,
  onRemove,
  onClear
}: WaypointInputProps) {
  const navigate = useNavigate();

  const handleInputClick = () => {
    navigate('/search', {
      state: {
        searchType: 'waypoint',
        currentValue: waypoint.value,
        waypointIndex: index
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter 키나 Space 키로도 검색 페이지 이동 가능
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInputClick();
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={waypoint.value}
        onChange={(e) => onValueChange(waypoint.id, e.target.value)}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        placeholder={`경유지 ${index + 1} 검색`}
        className="w-full h-9 pl-9 pr-16 bg-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-font cursor-pointer hover:border-primary transition-colors"
        readOnly
        tabIndex={0}
        aria-label={`경유지 ${index + 1} 검색 - 클릭하여 검색`}
        role="button"
      />
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
        {waypoint.value && (
          <button
            type="button"
            onClick={() => onClear(waypoint.id)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(waypoint.id)}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="경유지 제거"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

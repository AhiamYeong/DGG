import { useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { LocationInput } from '../ui/Input';

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

  const handleSearch = () => {
    navigate('/search', {
      state: {
        searchType: 'waypoint',
        currentValue: waypoint.value,
        waypointIndex: index
      }
    });
  };

  return (
    <div className="relative">
      <LocationInput
        type="waypoint"
        waypointIndex={index}
        value={waypoint.value}
        onChange={(e) => onValueChange(waypoint.id, e.target.value)}
        onSearch={handleSearch}
        onClear={() => onClear(waypoint.id)}
        showClear={!!waypoint.value}
        className="pr-16" // 제거 버튼을 위한 공간 확보
      />
      
      {/* 제거 버튼 */}
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
        <Button
          onClick={() => onRemove(waypoint.id)}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="경유지 제거"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
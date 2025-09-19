import { memo } from 'react';
import { MapIconButton } from '../ui/Button';

interface MapControlsProps {
  onLocationClick: () => void;
  position?: 'top-right' | 'bottom-right';
  className?: string;
}

/**
 * 지도 컨트롤 버튼들을 통합한 컴포넌트
 * 현재 위치, 폴리라인 표시, 경로 제거 등의 기능을 제공
 * React.memo로 불필요한 리렌더링 방지
 */
export const MapControls = memo<MapControlsProps>(({
  onLocationClick,
  position = 'bottom-right',
  className = ''
}) => {
  // 위치별 스타일 클래스
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-32 right-4'
  };

  return (
    <div className={`absolute ${positionClasses[position]} pointer-events-auto flex flex-col gap-2 ${className}`}>
      {/* 현재 위치 버튼 */}
      <MapIconButton
        onClick={onLocationClick}
        iconName="location"
        variant="location"
        aria-label="현재 위치로 이동"
        className="rounded-full shadow-lg"
      />
    </div>
  );
});

export default MapControls;

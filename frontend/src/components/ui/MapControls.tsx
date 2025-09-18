import { memo } from 'react';
import { IconMapButton } from './MapButton';

interface MapControlsProps {
  onLocationClick: () => void;
  onPolylineClick: () => void;
  onRemoveClick: () => void;
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
  onPolylineClick,
  onRemoveClick,
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
      <IconMapButton
        onClick={onLocationClick}
        iconName="location"
        variant="location"
        title="현재 위치로 이동"
      />
      
      {/* 폴리라인 테스트 버튼 */}
      <IconMapButton
        onClick={onPolylineClick}
        iconName="route"
        variant="polyline"
        title="강남역 -> 성수역 경로 표시"
      />
      
      {/* 폴리라인 제거 버튼 */}
      <IconMapButton
        onClick={onRemoveClick}
        iconName="close"
        variant="remove"
        title="경로 제거"
      />
    </div>
  );
});

export default MapControls;

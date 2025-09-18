import { memo } from 'react';
import { RouteInfo, SideSheet } from '../functional/Navigation';
import type { SimpleRoute } from '../../types/route-types';

interface NavigationModeProps {
  currentRoute: SimpleRoute;
  currentStepIndex: number;
  sideSheetPosition: number;
  onPositionChange: (position: number) => void;
  onClose: () => void;
  onStopNavigation: () => void;
  headerHeight?: number;
}

/**
 * 네비게이션 모드 컴포넌트
 * 경로 안내 중일 때 표시되는 UI 컴포넌트들
 * React.memo로 불필요한 리렌더링 방지
 */
export const NavigationMode = memo<NavigationModeProps>(({
  currentRoute,
  currentStepIndex,
  sideSheetPosition,
  onPositionChange,
  onClose,
  onStopNavigation,
  headerHeight = 140
}) => {
  return (
    <>
      {/* 경로 정보 컴포넌트 */}
      <RouteInfo
        route={currentRoute}
        currentStepIndex={currentStepIndex}
      />

      {/* 사이드 시트 */}
      <div className="pointer-events-auto">
        <SideSheet
          position={sideSheetPosition}
          route={currentRoute}
          onPositionChange={onPositionChange}
          onClose={onClose}
          headerHeight={headerHeight}
        />
      </div>

      {/* 네비게이션 종료 버튼 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto" style={{ zIndex: 15 }}>
        <button
          onClick={onStopNavigation}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg transition-colors"
        >
          안내 종료
        </button>
      </div>
    </>
  );
});

export default NavigationMode;

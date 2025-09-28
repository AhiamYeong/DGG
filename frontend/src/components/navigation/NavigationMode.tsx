import { memo, lazy, Suspense, useRef, useEffect, useState } from 'react';
import { RouteInfo } from '../route';
import type { SimpleRoute } from '../../types/route-types';

// Lazy load heavy SideSheet component
const SideSheet = lazy(() => import('../route/SideSheet'));

interface NavigationModeProps {
  currentRoute: SimpleRoute;
  currentStepIndex: number;
  sideSheetPosition: number;
  onPositionChange: (position: number) => void;
  onClose: () => void;
  onStopNavigation: () => void;
  headerHeight?: number;
  onMapMove?: (lat: number, lng: number) => void;
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
  headerHeight = 200,
  onMapMove
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [actualHeaderHeight, setActualHeaderHeight] = useState(headerHeight);

  // 헤더 높이를 동적으로 측정
  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      setActualHeaderHeight(height);
    }
  }, [currentRoute, currentStepIndex]);

  return (
    <>
      {/* 통합된 네비게이션 컨테이너 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* 경로 정보 헤더 */}
        <div ref={headerRef} className="absolute top-0 left-0 w-full z-30 pointer-events-auto">
          <RouteInfo
            route={currentRoute}
            currentStepIndex={currentStepIndex}
          />
        </div>

        {/* 사이드 시트 (헤더와 연결된 형태) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <Suspense fallback={<div className="w-full h-20 bg-gray-100 animate-pulse rounded-lg" />}>
            <SideSheet
              position={sideSheetPosition}
              route={currentRoute}
              onPositionChange={onPositionChange}
              onClose={onClose}
              headerHeight={actualHeaderHeight}
              onMapMove={onMapMove}
            />
          </Suspense>
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
      </div>
    </>
  );
});

export default NavigationMode;

import { memo, lazy, Suspense } from 'react';
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
  headerHeight = 200
}) => {
  return (
    <>
      {/* 통합된 네비게이션 컨테이너 */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        onClick={() => console.log('🚀 NavigationMode 컨테이너 터치됨!')}
        onTouchStart={() => console.log('🚀 NavigationMode 컨테이너 터치 시작!')}
      >
        {/* 경로 정보 헤더 - 최상단에 고정 */}
        <div 
          className="absolute top-0 left-0 w-full z-30 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            console.log('📋 RouteInfo 헤더 터치됨!');
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            console.log('📋 RouteInfo 헤더 터치 시작!');
          }}
        >
          <RouteInfo
            route={currentRoute}
            currentStepIndex={currentStepIndex}
          />
        </div>

        {/* 사이드 시트 - 헤더 아래에 위치 */}
        <div 
          className="absolute top-0 left-0 w-full h-full"
          onClick={(e) => {
            e.stopPropagation();
            console.log('📱 SideSheet 컨테이너 터치됨!');
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            console.log('📱 SideSheet 컨테이너 터치 시작!');
          }}
        >
          <Suspense fallback={<div className="w-full h-20 bg-gray-100 animate-pulse rounded-lg" />}>
            <SideSheet
              position={sideSheetPosition}
              route={currentRoute}
              onPositionChange={onPositionChange}
              onClose={onClose}
              headerHeight={headerHeight}
            />
          </Suspense>
        </div>

        {/* 네비게이션 종료 버튼 */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto" 
          style={{ zIndex: 15 }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🛑 네비게이션 종료 버튼 터치됨!');
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            console.log('🛑 네비게이션 종료 버튼 터치 시작!');
          }}
        >
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

import { memo, useCallback } from 'react';
import type { RouteTabType } from '../../../types/routes';

interface RouteTabsProps {
  activeTab: RouteTabType;
  onTabChange: (tab: RouteTabType) => void;
  favoriteCount: number;
  reservedCount: number;
  className?: string;
}

/**
 * RouteTabs - 즐겨찾기/예약 탭 전환 UI 컴포넌트
 * React 19 최신 패턴 적용:
 * - memo를 활용한 성능 최적화
 * - useCallback을 통한 이벤트 핸들러 최적화
 * - 접근성(a11y) 고려한 탭 UI
 */
const RouteTabs = memo<RouteTabsProps>(({
  activeTab,
  onTabChange,
  favoriteCount,
  reservedCount,
  className = ''
}) => {
  // 탭 변경 핸들러를 useCallback으로 최적화
  const handleTabChange = useCallback((tab: RouteTabType) => {
    onTabChange(tab);
  }, [onTabChange]);

  return (
    <div className={`px-6 pb-4 ${className}`}>
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-font">즐겨찾기 & 예약 노선</h3>
        <p className="text-sm text-secondary">자주 이용하는 경로를 빠르게 선택하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex bg-gray-100 rounded-lg p-1" role="tablist">
        {/* 즐겨찾기 탭 */}
        <button
          onClick={() => handleTabChange('favorite')}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
            ${activeTab === 'favorite' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-secondary hover:text-font hover:bg-white hover:bg-opacity-50'
            }
          `}
          role="tab"
          aria-selected={activeTab === 'favorite'}
          aria-controls="favorite-tabpanel"
          id="favorite-tab"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          즐겨찾기
          {favoriteCount > 0 && (
            <span className={`
              px-2 py-0.5 text-xs rounded-full
              ${activeTab === 'favorite' 
                ? 'bg-primary bg-opacity-20 text-primary' 
                : 'bg-gray-300 text-gray-600'
              }
            `}>
              {favoriteCount}
            </span>
          )}
        </button>

        {/* 예약 탭 */}
        <button
          onClick={() => handleTabChange('reserved')}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
            ${activeTab === 'reserved' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-secondary hover:text-font hover:bg-white hover:bg-opacity-50'
            }
          `}
          role="tab"
          aria-selected={activeTab === 'reserved'}
          aria-controls="reserved-tabpanel"
          id="reserved-tab"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          예약
          {reservedCount > 0 && (
            <span className={`
              px-2 py-0.5 text-xs rounded-full
              ${activeTab === 'reserved' 
                ? 'bg-primary bg-opacity-20 text-primary' 
                : 'bg-gray-300 text-gray-600'
              }
            `}>
              {reservedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
});

// 컴포넌트 이름 설정 (디버깅용)
RouteTabs.displayName = 'RouteTabs';

export default RouteTabs;

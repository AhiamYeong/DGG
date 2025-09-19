import React from 'react';
import RouteList from './RouteList';
import { Button, TabButton } from '@/components/ui';
import { formatTime } from '@/utils/timeUtils';
import type { SimpleRoute } from '@/types/route-types';

interface RouteResultsContainerProps {
  isOpen: boolean;
  routes: SimpleRoute[];
  actionLabel: string;
  selectedDepartureOption: 'now' | 'schedule';
  onSelectRoute: (route: SimpleRoute) => void;
  onDepartureOptionChange?: (option: 'now' | 'schedule') => void;
  onClose?: () => void;
  currentOrigin?: string;
  currentDestination?: string;
}

/**
 * 경로 검색 결과 컨테이너 컴포넌트
 * - 출발 옵션 탭 (지금 출발하기 / 출발예약)
 * - 경로 목록 (RouteList 컴포넌트 사용)
 */
export const RouteResultsContainer: React.FC<RouteResultsContainerProps> = ({
  isOpen,
  routes,
  actionLabel,
  selectedDepartureOption,
  onSelectRoute,
  onDepartureOptionChange,
  onClose,
  currentOrigin,
  currentDestination
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-24 bottom-0 left-0 right-0 pointer-events-auto z-[9999] bg-white">


      {/* 출발 옵션 탭 */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center justify-center gap-4 flex-1">
          <TabButton
            isActive={selectedDepartureOption === 'now'}
            onClick={() => onDepartureOptionChange?.('now')}
          >
            <span className="text-sm font-medium">지금 출발하기</span>
          </TabButton>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>

          <TabButton
            isActive={selectedDepartureOption === 'schedule'}
            onClick={() => onDepartureOptionChange?.('schedule')}
          >
            <span className="text-sm font-medium">
              출발예약 {formatTime(new Date())}
            </span>
          </TabButton>
        </div>
        
        {/* X 버튼 */}
        {onClose && (
          <Button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>
      
      {/* 경로 목록 */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {routes.length > 0 ? (
          <RouteList
            routes={routes}
            onSelectRoute={onSelectRoute}
            actionLabel={actionLabel}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-2">경로를 검색 중입니다...</p>
            <p className="text-xs text-gray-400">출발 옵션을 선택해주세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteResultsContainer;

import { memo, useCallback } from 'react';
import type { SimpleRoute } from '@/types/route-types';
import { Button } from '@/components/ui';
import { formatTime } from '@/utils/timeUtils';
import { getFatigueLevel } from '@/constants';

interface NavigationRouteCardProps {
  route: SimpleRoute;
  onSelect: (route: SimpleRoute) => Promise<void>;
  actionLabel?: string;
  className?: string;
}

/**
 * NavigationRouteCard - 경로 안내용 상세 정보 카드 컴포넌트
 * 즐겨찾기 카드와 달리 모든 상세 정보를 표시
 */
const NavigationRouteCard = memo<NavigationRouteCardProps>(({
  route,
  onSelect,
  actionLabel = '선택',
  className = ''
}) => {
  // 피로도 레벨 정보 가져오기
  const fatigueInfo = getFatigueLevel(route.fatigueLevel || 0);

  const handleSelect = useCallback(async () => {
    await onSelect(route);
  }, [onSelect, route]);

  return (
    <div
      className={`p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      {/* 첫 번째 줄: 제목 */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-lg text-gray-900 flex-1">
          {route.name}
        </h4>
      </div>

      {/* 두 번째 줄: 출발지 → 도착지 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-600">{route.from.name}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <span className="text-sm font-medium text-gray-600">{route.to.name}</span>
      </div>

      {/* 세 번째 줄: 상세 정보 그리드 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 총 소요시간 */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-xs text-gray-500">총 소요시간</div>
            <div className="text-sm font-semibold text-gray-900">{route.totalDuration}분</div>
          </div>
        </div>



        {/* 피로도 */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <div>
            <div className="text-xs text-gray-500">예상 피로도</div>
            <div className="text-sm font-semibold text-gray-900">
              레벨{fatigueInfo.level} ({fatigueInfo.label})
            </div>
          </div>
        </div>
      </div>

      {/* 시간 정보 */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">출발:</span> {formatTime(route.departureTime)}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">도착:</span> {formatTime(route.arrivalTime)}
        </div>
      </div>

      {/* 피로도 진행바 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">피로도</span>
          <span className="text-xs text-gray-500">{route.fatigueLevel || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${route.fatigueLevel || 0}%`,
              backgroundColor: fatigueInfo.color
            }}
          />
        </div>
      </div>

      {/* 선택 버튼 */}
      <div className="flex justify-end">
        <Button
          onClick={handleSelect}
          variant="primary"
          size="sm"
          className="px-6 py-2"
          aria-label={`${route.name} 노선 ${actionLabel}`}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
});

NavigationRouteCard.displayName = 'NavigationRouteCard';

export default NavigationRouteCard;

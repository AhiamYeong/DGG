import { memo, useCallback } from 'react';
import type { SimpleRoute } from '@/types/route-types';
import { Button } from '@/components/ui';
import FavoriteStar from '@/components/ui/FavoriteStar';
import { useRouteBookmark } from '@/hooks/useRouteBookmark';
import { getFatigueLevel } from '@/constants';

interface RouteCardProps {
  route: SimpleRoute;
  onSelect: (route: SimpleRoute) => Promise<void>;
  onToggleBookmark?: (id: string) => void;
  onShowOptions?: (id: string) => void;
  actionLabel?: string;
  className?: string;
}

/**
 * RouteCard - 개별 노선 카드 컴포넌트
 * React 19 최신 패턴 적용:
 * - memo를 활용한 성능 최적화
 * - useCallback을 통한 이벤트 핸들러 최적화
 * - 타입 안전성 강화
 */
const RouteCard = memo<RouteCardProps>(({
  route,
  onSelect,
  actionLabel = '선택',
  className = ''
}) => {
  const bookmark = useRouteBookmark(route);
  // 이벤트 핸들러들을 useCallback으로 최적화
  const handleSelect = useCallback(async () => {
    console.log('[RouteCard] card select', route.id);
    await onSelect(route);
  }, [onSelect, route]);



  return (
    <div
      className={
        `relative flex items-center justify-between p-4 bg-gray-50 rounded-lg 
        hover:bg-secondary hover:bg-opacity-20 transition-colors cursor-pointer ${className}`
      }
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      aria-label={`${route.name} 노선 선택`}
    >
      {/* 우상단 즐겨찾기 아이콘 (배경 투명, 커스텀 컴포넌트) */}
      <FavoriteStar
        active={bookmark.isBookmarked}
        onToggle={() => bookmark.toggle()}
        size={28}
        className="absolute top-2 right-2 z-10"
      />

      {/* 노선 정보 */}
      <div className="flex-1 pr-8">
        {/* 노선명과 즐겨찾기 아이콘 */}
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-font">{route.name}</h4>
        </div>

        {/* 출발지 → 도착지 */}
        <div className="flex items-center gap-2 text-sm text-secondary">
          <span className="font-medium">{route.from.name}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="font-medium">{route.to.name}</span>
        </div>
        

        {/* 경로 정보 */}
        <div className="flex items-center gap-4 text-xs text-secondary mt-1">
          <span>{route.totalDuration}분</span>
          <span>{Math.round(route.totalDistance / 1000)}km</span>
          <span>{route.price ? `${route.price.toLocaleString()}원` : '무료'}</span>
        </div>

        {/* 출발/도착 시간 */}
        <div className="text-xs text-secondary mt-1">
          {route.departureTime.hour.toString().padStart(2, '0')}:{route.departureTime.minute.toString().padStart(2, '0')} → {route.arrivalTime.hour.toString().padStart(2, '0')}:{route.arrivalTime.minute.toString().padStart(2, '0')}
        </div>

        {/* 피로도 표시 */}
        <div className="mt-2">
          {(() => {
            const fatigueInfo = getFatigueLevel(route.fatigueLevel || 50);
            return (
              <>
                <div className="flex items-center justify-between text-xs text-secondary mb-1">
                  <span>예상 증가 피로도</span>
                  <span>레벨{fatigueInfo.level} ({fatigueInfo.label})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${route.fatigueLevel || 50}%`,
                      backgroundColor: fatigueInfo.color
                    }}
                  />
                </div>
              </>
            );
          })()}
        </div>
      </div>
      
      {/* 액션 버튼들 */}
      <div className="flex items-center gap-2">

        {/* 선택 버튼 */}
        <Button
          onClick={(e) => {
            e.stopPropagation(); // 이벤트 버블링 방지
            handleSelect();
          }}
          variant="primary"
          size="sm"
          className="px-4 py-2"
          aria-label={`${route.name} 노선 ${actionLabel}`}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
});

// 컴포넌트 이름 설정 (디버깅용)
RouteCard.displayName = 'RouteCard';

export default RouteCard;

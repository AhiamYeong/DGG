import { memo, useCallback } from 'react';
import type { SimpleRoute } from '../../../types/route-types';
import { Button, IconButton } from '../../ui';

interface RouteCardProps {
  route: SimpleRoute;
  onSelect: (route: SimpleRoute) => void;
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
  onToggleBookmark,
  onShowOptions,
  actionLabel = '선택',
  className = ''
}) => {
  // 이벤트 핸들러들을 useCallback으로 최적화
  const handleSelect = useCallback(() => {
    onSelect(route);
  }, [onSelect, route]);

  const handleToggleBookmark = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 선택 이벤트와 분리
    onToggleBookmark?.(route.id);
  }, [onToggleBookmark, route.id]);

  const handleShowOptions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 선택 이벤트와 분리
    onShowOptions?.(route.id);
  }, [onShowOptions, route.id]);

  return (
    <div
      className={`
        flex items-center justify-between p-4 bg-gray-50 rounded-lg 
        hover:bg-secondary hover:bg-opacity-20 transition-colors cursor-pointer
        ${className}
      `}
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
      {/* 노선 정보 */}
      <div className="flex-1">
        {/* 노선명과 즐겨찾기 아이콘 */}
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-font">{route.name}</h4>
          <IconButton
            icon={
              <svg 
                className={`w-4 h-4 ${route.isBookmarked ? 'text-accent fill-current' : 'text-gray-400'}`}
                fill={route.isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 20 20"
                data-testid="star-icon"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
            onClick={handleToggleBookmark}
            className="p-1 hover:bg-accent hover:bg-opacity-20 rounded transition-colors"
            aria-label={route.isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          />
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
          <span>⏱️ {route.totalDuration}분</span>
          <span>📏 {Math.round(route.totalDistance / 1000)}km</span>
          <span>💰 {route.price ? `${route.price.toLocaleString()}원` : '무료'}</span>
        </div>

        {/* 출발/도착 시간 */}
        <div className="text-xs text-secondary mt-1">
          {route.departureTime.hour.toString().padStart(2, '0')}:{route.departureTime.minute.toString().padStart(2, '0')} → {route.arrivalTime.hour.toString().padStart(2, '0')}:{route.arrivalTime.minute.toString().padStart(2, '0')}
        </div>

        {/* 피로도 표시 */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-secondary mb-1">
            <span>예상 증가 피로도</span>
            <span>{route.fatigueLevel || 50}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                (route.fatigueLevel || 50) <= 30 ? 'bg-level-1' :
                (route.fatigueLevel || 50) <= 50 ? 'bg-level-2' :
                (route.fatigueLevel || 50) <= 70 ? 'bg-level-3' :
                (route.fatigueLevel || 50) <= 90 ? 'bg-level-4' : 'bg-level-5'
              }`}
              style={{ width: `${route.fatigueLevel || 50}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 액션 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 옵션 메뉴 버튼 */}
        <IconButton
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          }
          onClick={handleShowOptions}
          className="p-2 text-secondary hover:text-font transition-colors rounded"
          aria-label="옵션 메뉴"
        />

        {/* 선택 버튼 */}
        <Button
          onClick={handleSelect}
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

import { memo, useCallback, useState } from 'react';
import type { SimpleRoute } from '@/types/route-types';
import { Button, ConfirmDialog } from '@/components/ui';
import FavoriteStar from '@/components/ui/FavoriteStar';
import { useRouteBookmark } from '@/hooks/useRouteBookmark';

interface RouteCardProps {
  route: SimpleRoute;
  onSelect: (route: SimpleRoute) => Promise<void>;
  onToggleBookmark?: (id: string) => void;
  onShowOptions?: (id: string) => void;
  onEdit?: (route: SimpleRoute) => void;
  actionLabel?: string;
  showEditButton?: boolean;
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
  onEdit,
  actionLabel = '선택',
  showEditButton = false,
  className = ''
}) => {
  const bookmark = useRouteBookmark(route);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // 이벤트 핸들러들을 useCallback으로 최적화
  const handleSelect = useCallback(async () => {
    await onSelect(route);
  }, [onSelect, route]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    onEdit?.(route);
  }, [onEdit, route]);

  // 즐겨찾기 해제 확인 핸들러
  const handleStarClick = useCallback((_next: boolean) => {
    if (bookmark.isBookmarked) {
      setShowConfirmDialog(true);
    } else {
      bookmark.toggle();
    }
  }, [bookmark]);

  // 확인 다이얼로그 핸들러들
  const handleConfirmRemove = useCallback(() => {
    bookmark.toggle();
    setShowConfirmDialog(false);
  }, [bookmark]);

  const handleCancelRemove = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);



  return (
    <div
      className={
        `p-4 bg-gray-50 rounded-lg 
        hover:bg-secondary hover:bg-opacity-20 transition-colors ${className}`
      }
    >
      {/* 첫 번째 줄: 제목과 즐겨찾기 */}
      <div className="flex items-center justify-between mb-3">
        <h4 
          className="font-medium text-font text-lg cursor-pointer flex-1"
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
          {route.name}
        </h4>
        <FavoriteStar
          active={bookmark.isBookmarked}
          onToggle={handleStarClick}
          size={24}
          className="flex-shrink-0"
        />
      </div>

      {/* 두 번째 줄: 경로 정보와 액션 버튼들 */}
      <div className="flex items-center justify-between">
        {/* 경로 정보 */}
        <div className="flex items-center gap-2 text-sm text-secondary flex-1">
          <span className="font-medium">{route.from.name}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="font-medium">{route.to.name}</span>
        </div>
        
        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {/* 편집 버튼 (즐겨찾기 경로인 경우에만 표시) */}
          {showEditButton && onEdit && (
            <Button
              onClick={handleEdit}
              variant="secondary"
              size="sm"
              className="px-3 py-2"
              aria-label={`${route.name} 편집`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
          )}

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

      {/* 즐겨찾기 해제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="즐겨찾기 해제"
        message="즐겨찾기를 해제하시겠습니까?"
        confirmText="예"
        cancelText="아니오"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </div>
  );
});

// 컴포넌트 이름 설정 (디버깅용)
RouteCard.displayName = 'RouteCard';

export default RouteCard;

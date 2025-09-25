import { memo, useCallback, useMemo } from 'react';
import RouteCard from './RouteCard';
import type { SimpleRoute } from '@/types/route-types';

interface RouteListProps {
  routes: SimpleRoute[];
  onSelectRoute: (route: SimpleRoute) => Promise<void>;
  onToggleBookmark?: (id: string) => void;
  onShowOptions?: (id: string) => void;
  onEditRoute?: (route: SimpleRoute) => void;
  emptyMessage?: string;
  actionLabel?: string;
  showEditButton?: boolean;
  className?: string;
}

/**
 * RouteList - 노선 목록 컨테이너 컴포넌트
 * React 19 최신 패턴 적용:
 * - memo를 활용한 성능 최적화
 * - useMemo를 통한 리스트 렌더링 최적화
 * - useCallback을 통한 이벤트 핸들러 최적화
 * - 조건부 렌더링 최적화
 */
const RouteList = memo<RouteListProps>(({
  routes,
  onSelectRoute,
  onToggleBookmark,
  onShowOptions,
  onEditRoute,
  emptyMessage = '등록된 노선이 없습니다',
  actionLabel = '선택',
  showEditButton = false,
  className = ''
}) => {
  // 이벤트 핸들러들을 useCallback으로 최적화
  const handleSelectRoute = useCallback(async (route: SimpleRoute) => {
    await onSelectRoute(route);
  }, [onSelectRoute]);

  const handleToggleBookmark = useCallback((id: string) => {
    onToggleBookmark?.(id);
  }, [onToggleBookmark]);

  const handleShowOptions = useCallback((id: string) => {
    onShowOptions?.(id);
  }, [onShowOptions]);

  const handleEditRoute = useCallback((route: SimpleRoute) => {
    console.log('RouteList handleEditRoute 호출됨:', route);
    onEditRoute?.(route);
  }, [onEditRoute]);


  // 빈 상태 메시지 렌더링을 useMemo로 최적화
  const emptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <p className="text-secondary text-sm mb-2">{emptyMessage}</p>
      <p className="text-xs text-gray-400">새 경로를 추가해보세요</p>
    </div>
  ), [emptyMessage]);

  // 노선 목록 렌더링을 useMemo로 최적화
  const routeItems = useMemo(() => (
    <div className="space-y-3">
      {routes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          onSelect={handleSelectRoute}
          onToggleBookmark={handleToggleBookmark}
          onShowOptions={handleShowOptions}
          onEdit={handleEditRoute}
          actionLabel={actionLabel}
          showEditButton={showEditButton}
        />
      ))}
    </div>
  ), [routes, handleSelectRoute, handleToggleBookmark, handleShowOptions, handleEditRoute, actionLabel, showEditButton]);

  // 새 경로 추가 버튼 제거됨

  return (
    <div className={`px-4 py-2 ${className}`}>
      {routes.length > 0 ? (
        routeItems
      ) : (
        emptyState
      )}
    </div>
  );
});

// 컴포넌트 이름 설정 (디버깅용)
RouteList.displayName = 'RouteList';

export default RouteList;

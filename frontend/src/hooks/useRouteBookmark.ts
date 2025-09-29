import { useCallback, useState } from 'react';
import type { SimpleRoute } from '@/types/route-types';
import { useRouteSearchStore } from '@/stores/useRouteSearchStore';

export function useRouteBookmark(route: SimpleRoute | null) {
  const { addBookmarkForRoute, removeBookmarkForRoute } = useRouteSearchStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBookmarked = !!route?.isBookmarked;

  const toggle = useCallback(async () => {
    if (!route || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      if (route.isBookmarked) {
        await removeBookmarkForRoute(route.id);
      } else {
        await addBookmarkForRoute(route);
      }
    } catch (e: any) {
      setError(e?.message || '즐겨찾기 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [route, isLoading, addBookmarkForRoute, removeBookmarkForRoute]);

  return { isBookmarked, isLoading, error, toggle };
}

export default useRouteBookmark;


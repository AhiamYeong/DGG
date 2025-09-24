import { useState, useCallback } from 'react';
import { favoritePlacesApi } from '@/api/favoritePlacesApi';

export function useFavoritePlaceActions(refetch?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFavoritePlace = useCallback(async (args: { placeName: string; address: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await favoritePlacesApi.addFavoritePlace(args);
      if (!res.success) throw new Error(res.message || '즐겨찾기 추가 실패');
      console.log('즐겨찾기 추가 성공');
      refetch?.();
    } catch (e: any) {
      console.error('즐겨찾기 추가 실패', e);
      setError(e?.message || '즐겨찾기 추가 실패');
      alert('즐겨찾기 추가에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);

  const deleteFavoritePlace = useCallback(async (bookmarkPlaceId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await favoritePlacesApi.deleteFavoritePlace(bookmarkPlaceId);
      if (!res.success) throw new Error(res.message || '즐겨찾기 삭제 실패');
      console.log('즐겨찾기 삭제 성공');
      refetch?.();
    } catch (e: any) {
      console.error('즐겨찾기 삭제 실패', e);
      setError(e?.message || '즐겨찾기 삭제 실패');
      alert('즐겨찾기 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);

  return { isLoading, error, addFavoritePlace, deleteFavoritePlace };
}

export default useFavoritePlaceActions;


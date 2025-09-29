import { useEffect, useCallback, useState } from 'react';
import { 
  favoritePlacesApi,
  type FavoritePlace
} from '../api/favoritePlacesApi';
import { ERROR_MESSAGES } from '../constants';
import { log } from '../utils/logger';

/**
 * 즐겨찾기 장소 관리 훅
 */
export function useSearchHistory() {
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공통 API 호출 헬퍼
  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<{ success: boolean; data: T; message?: string }>,
    setter: (data: T) => void,
    errorMessage: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      if (response.success) {
        setter(response.data);
      } else {
        setError(response.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      setError(errorMessage);
      log.warn(errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, []);


  // 즐겨찾기 장소 불러오기
  const loadFavoritePlaces = useCallback(async () => {
    await handleApiCall(
      favoritePlacesApi.getFavoritePlaces,
      setFavoritePlaces,
      ERROR_MESSAGES.SEARCH.LOAD_FAVORITES_FAILED
    );
  }, [handleApiCall]);


  // 즐겨찾기 장소 추가
  const addFavoritePlace = useCallback(async (request: { placeName: string; address: string }) => {
    try {
      const response = await favoritePlacesApi.addFavoritePlace(request);
      if (response.success) {
        // 로컬 상태 업데이트
        setFavoritePlaces(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.message || '알 수 없는 오류가 발생했습니다.');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = '즐겨찾기 장소 추가에 실패했습니다.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // 즐겨찾기 장소 삭제
  const removeFavoritePlace = useCallback(async (id: string) => {
    try {
      const response = await favoritePlacesApi.deleteFavoritePlace(id);
      if (response.success) {
        // 로컬 상태 업데이트
        setFavoritePlaces(prev => prev.filter(item => item.id !== id));
        return { success: true };
      } else {
        setError(response.message || '알 수 없는 오류가 발생했습니다.');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = '즐겨찾기 장소 삭제에 실패했습니다.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // 즐겨찾기 토글 (추가/삭제)
  const toggleFavoritePlace = useCallback(async (place: FavoritePlace) => {
    const isCurrentlyFavorite = favoritePlaces.some(fav => fav.id === place.id);
    
    if (isCurrentlyFavorite) {
      return await removeFavoritePlace(place.id);
    } else {
      const request = {
        placeName: place.title,
        address: place.roadAddress || place.address
      };
      return await addFavoritePlace(request);
    }
  }, [favoritePlaces, addFavoritePlace, removeFavoritePlace]);

  // 초기 데이터 로드
  useEffect(() => {
    loadFavoritePlaces();
  }, [loadFavoritePlaces]);

  // 모든 데이터 새로고침
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loadFavoritePlaces();
    } catch (err) {
      setError('데이터를 새로고침하는데 실패했습니다.');
      log.warn('데이터 새로고침 실패', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadFavoritePlaces]);

  return {
    // 상태
    favoritePlaces,
    isLoading,
    error,
    
    // 액션
    loadFavoritePlaces,
    addFavoritePlace,
    removeFavoritePlace,
    toggleFavoritePlace,
    
    // 유틸리티
    clearError: () => setError(null),
    refreshAll
  };
}
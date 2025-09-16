import { useState, useEffect, useCallback } from 'react';
import { 
  recentSearchApi, 
  favoritePlacesApi, 
  type RecentSearch, 
  type FavoritePlace,
  type AddRecentSearchRequest,
  type AddFavoritePlaceRequest
} from '../services/searchHistoryApi';

/**
 * 검색 내역 관리 훅
 */
export function useSearchHistory() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공통 API 호출 함수
  const loadData = useCallback(async <T>(
    apiCall: () => Promise<{ success: boolean; data: T; message: string }>,
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
        setError(response.message);
      }
    } catch (err) {
      setError(errorMessage);
      console.warn(`${errorMessage}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 최근 검색 내역 불러오기
  const loadRecentSearches = useCallback(async () => {
    await loadData(
      recentSearchApi.getRecentSearches,
      setRecentSearches,
      '최근 검색 내역을 불러오는데 실패했습니다.'
    );
  }, [loadData]);

  // 즐겨찾기 장소 불러오기
  const loadFavoritePlaces = useCallback(async () => {
    await loadData(
      favoritePlacesApi.getFavoritePlaces,
      setFavoritePlaces,
      '즐겨찾기 장소를 불러오는데 실패했습니다.'
    );
  }, [loadData]);

  // 최근 검색 내역 추가
  const addRecentSearch = useCallback(async (request: AddRecentSearchRequest) => {
    try {
      const response = await recentSearchApi.addRecentSearch(request);
      if (response.success) {
        // 로컬 상태 업데이트
        setRecentSearches(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        // API 실패 시 에러를 설정하지 않고 조용히 실패 (사용자 경험 우선)
        console.warn('검색 내역 추가 실패:', response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      // 네트워크 오류 시에도 에러를 설정하지 않고 조용히 실패
      console.warn('검색 내역 추가 실패 (네트워크 오류):', err);
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }, []);

  // 최근 검색 내역 삭제
  const removeRecentSearch = useCallback(async (id: string) => {
    try {
      const response = await recentSearchApi.deleteRecentSearch(id);
      if (response.success) {
        // 로컬 상태 업데이트
        setRecentSearches(prev => prev.filter(item => item.id !== id));
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = '최근 검색 내역 삭제에 실패했습니다.';
      setError(errorMessage);
      console.warn('최근 검색 내역 삭제 실패:', err);
      return { success: false, error: errorMessage };
    }
  }, []);

  // 즐겨찾기 장소 추가
  const addFavoritePlace = useCallback(async (request: AddFavoritePlaceRequest) => {
    try {
      const response = await favoritePlacesApi.addFavoritePlace(request);
      if (response.success) {
        // 로컬 상태 업데이트
        setFavoritePlaces(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = '즐겨찾기 장소 추가에 실패했습니다.';
      setError(errorMessage);
      console.warn('즐겨찾기 장소 추가 실패:', err);
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
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = '즐겨찾기 장소 삭제에 실패했습니다.';
      setError(errorMessage);
      console.warn('즐겨찾기 장소 삭제 실패:', err);
      return { success: false, error: errorMessage };
    }
  }, []);

  // 즐겨찾기 토글 (추가/삭제)
  const toggleFavoritePlace = useCallback(async (place: FavoritePlace) => {
    const isCurrentlyFavorite = favoritePlaces.some(fav => fav.id === place.id);
    
    if (isCurrentlyFavorite) {
      return await removeFavoritePlace(place.id);
    } else {
      const request: AddFavoritePlaceRequest = {
        title: place.title,
        category: place.category,
        address: place.address,
        roadAddress: place.roadAddress,
        telephone: place.telephone,
        coordinates: place.coordinates
      };
      return await addFavoritePlace(request);
    }
  }, [favoritePlaces, addFavoritePlace, removeFavoritePlace]);

  // 초기 데이터 로드
  useEffect(() => {
    loadRecentSearches();
    loadFavoritePlaces();
  }, [loadRecentSearches, loadFavoritePlaces]);

  // 모든 데이터 새로고침
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadRecentSearches(),
        loadFavoritePlaces()
      ]);
    } catch (err) {
      setError('데이터를 새로고침하는데 실패했습니다.');
      console.warn('데이터 새로고침 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadRecentSearches, loadFavoritePlaces]);

  return {
    // 상태
    recentSearches,
    favoritePlaces,
    isLoading,
    error,
    
    // 액션
    loadRecentSearches,
    loadFavoritePlaces,
    addRecentSearch,
    removeRecentSearch,
    addFavoritePlace,
    removeFavoritePlace,
    toggleFavoritePlace,
    
    // 유틸리티
    clearError: () => setError(null),
    refreshAll
  };
}

import { useEffect, useCallback } from 'react';
import { 
  recentSearchApi, 
  favoritePlacesApi, 
  type RecentSearch, 
  type FavoritePlace,
  type AddRecentSearchRequest,
  type AddFavoritePlaceRequest
} from '../services/searchHistoryApi';
import { useAsyncOperation } from './useAsyncOperation';

/**
 * 검색 내역 관리 훅
 */
export function useSearchHistory() {
  // 최근 검색 내역 관리
  const recentSearchesOperation = useAsyncOperation(recentSearchApi.getRecentSearches);
  const favoritePlacesOperation = useAsyncOperation(favoritePlacesApi.getFavoritePlaces);
  
  // 추가/삭제 작업들
  const addRecentSearchOperation = useAsyncOperation(recentSearchApi.addRecentSearch);
  const removeRecentSearchOperation = useAsyncOperation(recentSearchApi.deleteRecentSearch);
  const addFavoritePlaceOperation = useAsyncOperation(favoritePlacesApi.addFavoritePlace);
  const removeFavoritePlaceOperation = useAsyncOperation(favoritePlacesApi.deleteFavoritePlace);

  // 데이터 로드 함수들
  const loadRecentSearches = useCallback(async () => {
    const result = await recentSearchesOperation.execute();
    if (result.success && result.data && result.data.success) {
      recentSearchesOperation.setData(result.data.data);
    }
  }, [recentSearchesOperation]);

  const loadFavoritePlaces = useCallback(async () => {
    const result = await favoritePlacesOperation.execute();
    if (result.success && result.data && result.data.success) {
      favoritePlacesOperation.setData(result.data.data);
    }
  }, [favoritePlacesOperation]);

  // 최근 검색 내역 추가
  const addRecentSearch = useCallback(async (request: AddRecentSearchRequest) => {
    const result = await addRecentSearchOperation.execute(request);
    if (result.success && result.data && result.data.success) {
      // 로컬 상태 업데이트
      const currentData = recentSearchesOperation.data || [];
      recentSearchesOperation.setData([result.data.data, ...currentData]);
    }
    return result;
  }, [addRecentSearchOperation, recentSearchesOperation]);

  // 최근 검색 내역 삭제
  const removeRecentSearch = useCallback(async (id: string) => {
    const result = await removeRecentSearchOperation.execute(id);
    if (result.success) {
      // 로컬 상태 업데이트
      const currentData = recentSearchesOperation.data || [];
      recentSearchesOperation.setData(currentData.filter((item: RecentSearch) => item.id !== id));
    }
    return result;
  }, [removeRecentSearchOperation, recentSearchesOperation]);

  // 즐겨찾기 장소 추가
  const addFavoritePlace = useCallback(async (request: AddFavoritePlaceRequest) => {
    const result = await addFavoritePlaceOperation.execute(request);
    if (result.success && result.data && result.data.success) {
      // 로컬 상태 업데이트
      const currentData = favoritePlacesOperation.data || [];
      favoritePlacesOperation.setData([result.data.data, ...currentData]);
    }
    return result;
  }, [addFavoritePlaceOperation, favoritePlacesOperation]);

  // 즐겨찾기 장소 삭제
  const removeFavoritePlace = useCallback(async (id: string) => {
    const result = await removeFavoritePlaceOperation.execute(id);
    if (result.success) {
      // 로컬 상태 업데이트
      const currentData = favoritePlacesOperation.data || [];
      favoritePlacesOperation.setData(currentData.filter((item: FavoritePlace) => item.id !== id));
    }
    return result;
  }, [removeFavoritePlaceOperation, favoritePlacesOperation]);

  // 즐겨찾기 토글 (추가/삭제)
  const toggleFavoritePlace = useCallback(async (place: FavoritePlace) => {
    const currentData = favoritePlacesOperation.data || [];
    const isCurrentlyFavorite = currentData.some((fav: FavoritePlace) => fav.id === place.id);
    
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
  }, [favoritePlacesOperation.data, addFavoritePlace, removeFavoritePlace]);

  // 초기 데이터 로드
  useEffect(() => {
    loadRecentSearches();
    loadFavoritePlaces();
  }, [loadRecentSearches, loadFavoritePlaces]);

  // 모든 데이터 새로고침
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadRecentSearches(),
      loadFavoritePlaces()
    ]);
  }, [loadRecentSearches, loadFavoritePlaces]);

  // 통합된 로딩 상태
  const isLoading = recentSearchesOperation.isLoading || favoritePlacesOperation.isLoading;
  
  // 통합된 에러 상태
  const error = recentSearchesOperation.error || favoritePlacesOperation.error;

  return {
    // 상태
    recentSearches: recentSearchesOperation.data || [],
    favoritePlaces: favoritePlacesOperation.data || [],
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
    clearError: () => {
      recentSearchesOperation.clearError();
      favoritePlacesOperation.clearError();
    },
    refreshAll
  };
}

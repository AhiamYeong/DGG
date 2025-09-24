import { useEffect, useState, useCallback } from 'react';
import type { ApiResponse, RecentSearchApiResponse, FavoritePlaceApiResponse } from '@/types/api-types';
import { recentSearchApi } from '@/api/searchHistoryApi';
import { favoritePlacesApi } from '@/api/favoritePlacesApi';

type Tab = 'recent' | 'favorite';

export function useSearchTabData(activeTab: Tab) {
  const [items, setItems] = useState<RecentSearchApiResponse[] | FavoritePlaceApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let res: ApiResponse<any>;
      if (activeTab === 'recent') {
        res = await recentSearchApi.getRecentSearches();
      } else {
        res = await favoritePlacesApi.getFavoritePlaces();
      }
      if (res.success) {
        setItems(res.data || []);
      } else {
        setError(res.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (e: any) {
      setError(e?.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, isLoading, error, refetch: fetchData };
}

export default useSearchTabData;


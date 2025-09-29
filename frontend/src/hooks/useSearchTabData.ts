import { useEffect, useState, useCallback } from 'react';
import type { FavoritePlaceApiResponse } from '@/types/api-types';
import { favoritePlacesApi } from '@/api/favoritePlacesApi';

export function useSearchTabData() {
  const [items, setItems] = useState<FavoritePlaceApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await favoritePlacesApi.getFavoritePlaces();
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, isLoading, error, refetch: fetchData };
}

export default useSearchTabData;


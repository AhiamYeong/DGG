import { useState, useCallback, useEffect } from 'react';
import { searchPlacesWithApi } from '../services/placeSearchApi';
import type { SearchResult } from '../types/search';

interface UsePlaceSearchOptions {
  display?: number;
  sort?: 'random' | 'comment';
  debounceMs?: number;
}

interface UsePlaceSearchReturn {
  searchQuery: string;
  searchState: {
    results: SearchResult[];
    isLoading: boolean;
    error?: string;
  };
  handleSearchChange: (query: string) => void;
  clearSearch: () => void;
}

/**
 * 장소 검색 훅
 */
export const usePlaceSearch = (options: UsePlaceSearchOptions = {}): UsePlaceSearchReturn => {
  const { display = 10, sort = 'random', debounceMs = 300 } = options;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        setError(undefined);
        return;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        const response = await searchPlacesWithApi(query);
        
        if (response.success) {
          setResults(response.data);
        } else {
          setError(response.message);
          setResults([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.';
        setError(errorMessage);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [debounceMs]
  );

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  // 검색 초기화
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setResults([]);
    setError(undefined);
    setIsLoading(false);
  }, []);

  return {
    searchQuery,
    searchState: {
      results,
      isLoading,
      error
    },
    handleSearchChange,
    clearSearch
  };
};

// 디바운스 유틸리티 함수
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

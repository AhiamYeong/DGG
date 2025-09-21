import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchDebounce } from './useDebounce';
import { UI_CONSTANTS } from '../constants';

// Dynamic import for large API module
const loadSearchApi = () => import('../api/placeSearchApi');

// Import types separately (they're small)
import type { SearchOptions } from '../api/placeSearchApi';

// 검색 결과 타입 (앱에서 사용하는 형식)
export interface SearchResult {
  id: string;
  name: string;
  address: string;
  roadAddress?: string;
  category: string;
  description: string;
  distance?: number;
  rating?: number;
  isFavorite?: boolean;
  location: {
    lat: number;
    lng: number;
  };
  phone?: string;
  link?: string;
  // 네이버 API 관련 필드
  title?: string;
  telephone?: string;
  mapx?: number;
  mapy?: number;
  type?: string;
}

// 검색 상태 타입
interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  total: number;
}

/**
 * 네이버 지역 검색 API 훅
 * 디바운스와 API 호출을 통합 관리
 */
export function useNaverSearch(options: SearchOptions = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
    total: 0,
  });

  // options 객체를 메모이제이션하여 무한 루프 방지
  const memoizedOptions = useMemo(() => options, [
    options.display,
    options.start,
    options.sort
  ]);

  // 디바운스된 검색어 (500ms 지연)
  const debouncedQuery = useSearchDebounce(searchQuery, UI_CONSTANTS.DEBOUNCE_DELAY);

  // 검색 실행 함수 (외부에서 호출용)
  const executeSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchState({
        results: [],
        isLoading: false,
        error: null,
        hasSearched: false,
        total: 0,
      });
      return;
    }

    setSearchState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const { searchPlaces, removeBTags } = await loadSearchApi();
      const apiResponse = await searchPlaces(query, memoizedOptions);
      
      // API 응답을 앱 형식으로 변환
      const convertedResults = apiResponse.items.map((item, index) => ({
        id: `search_${index}_${Date.now()}`,
        name: removeBTags(item.title),
        title: item.title,
        address: item.address,
        roadAddress: item.roadAddress,
        category: 'place',
        description: item.address,
        distance: undefined,
        rating: undefined,
        isFavorite: false,
        location: {
          lat: 37.5665,
          lng: 126.9780
        },
        type: 'landmark' as const
      }));
      
      const response = {
        success: true,
        data: convertedResults,
        total: apiResponse.items.length,
        message: `${apiResponse.items.length}개의 검색 결과를 찾았습니다.`
      };
      
      if (response.success) {
        setSearchState({
          results: response.data,
          isLoading: false,
          error: null,
          hasSearched: true,
          total: response.total,
        });
      } else {
        setSearchState({
          results: [],
          isLoading: false,
          error: response.message,
          hasSearched: true,
          total: 0,
        });
      }
    } catch (error) {
      console.error('네이버 검색 API 에러:', error);
      setSearchState({
        results: [],
        isLoading: false,
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.',
        hasSearched: true,
        total: 0,
      });
    }
  }, [memoizedOptions]);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 검색 초기화
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchState({
      results: [],
      isLoading: false,
      error: null,
      hasSearched: false,
      total: 0,
    });
  }, []);

  // 디바운스된 검색어가 변경될 때 검색 실행
  useEffect(() => {
    if (debouncedQuery !== searchQuery) {
      return; // 아직 타이핑 중이면 검색하지 않음
    }
    
    // 검색 실행 로직을 useEffect 내부로 이동
    const performSearch = async (query: string) => {
      if (!query.trim()) {
        setSearchState({
          results: [],
          isLoading: false,
          error: null,
          hasSearched: false,
          total: 0,
        });
        return;
      }

      setSearchState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const { searchPlaces, removeBTags } = await loadSearchApi();
        const apiResponse = await searchPlaces(query, memoizedOptions);
        
        // API 응답을 앱 형식으로 변환
        const convertedResults = apiResponse.items.map((item, index) => ({
          id: `search_${index}_${Date.now()}`,
          name: removeBTags(item.title),
          title: item.title,
          address: item.address,
          roadAddress: item.roadAddress,
          category: 'place',
          description: item.address,
          distance: undefined,
          rating: undefined,
          isFavorite: false,
          location: {
            lat: 37.5665,
            lng: 126.9780
          },
          type: 'landmark' as const
        }));
        
        const response = {
          success: true,
          data: convertedResults,
          total: apiResponse.items.length,
          message: `${apiResponse.items.length}개의 검색 결과를 찾았습니다.`
        };
        
        if (response.success) {
          setSearchState({
            results: response.data,
            isLoading: false,
            error: null,
            hasSearched: true,
            total: response.total,
          });
        } else {
          setSearchState({
            results: [],
            isLoading: false,
            error: response.message,
            hasSearched: true,
            total: 0,
          });
        }
      } catch (error) {
        console.error('네이버 검색 API 에러:', error);
        setSearchState({
          results: [],
          isLoading: false,
          error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.',
          hasSearched: true,
          total: 0,
        });
      }
    };
    
    performSearch(debouncedQuery);
  }, [debouncedQuery, searchQuery, memoizedOptions]);

  return {
    // 상태
    searchQuery,
    searchState,
    
    // 액션
    handleSearchChange,
    clearSearch,
    executeSearch,
  };
}

export default useNaverSearch;

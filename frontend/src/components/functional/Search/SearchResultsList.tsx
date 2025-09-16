import { memo, useCallback } from 'react';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  category?: string;
  distance?: number; // 미터 단위
  rating?: number;
}

interface SearchResultsListProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  onToggleFavorite: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
  total?: number;
  className?: string;
}

/**
 * SearchResultsList - 검색 결과 리스트 컴포넌트
 * React 19 최신 패턴 적용:
 * - memo를 활용한 성능 최적화
 * - useCallback을 통한 이벤트 핸들러 최적화
 */
const SearchResultsList = memo<SearchResultsListProps>(({
  results,
  onSelect,
  onToggleFavorite,
  isLoading = false,
  error = null,
  total = 0,
  className = ''
}) => {
  const handleSelect = useCallback((result: SearchResult) => {
    onSelect(result);
  }, [onSelect]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleFavorite(id);
  }, [onToggleFavorite]);

  if (isLoading) {
    return (
      <div className={`${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center gap-3 py-3 bg-background border-b border-gray-100 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 text-sm font-medium">검색 중 오류가 발생했습니다</p>
        <p className="text-gray-400 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">검색 결과가 없습니다</p>
        <p className="text-gray-400 text-xs mt-1">다른 검색어로 시도해보세요</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* 검색 결과 헤더 */}
      {total > 0 && (
        <div className="py-2 px-1 text-xs text-gray-500 border-b border-gray-100">
          총 {total}개의 검색 결과
        </div>
      )}
      
      {results.map((result) => (
        <div
          key={result.id}
          onClick={() => handleSelect(result)}
          className="flex items-center justify-between py-3 bg-background border-b border-gray-100 hover:bg-primary hover:bg-opacity-5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 flex-1">
            {/* 장소 아이콘 */}
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            {/* 장소 정보 */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-font text-sm truncate">{result.name}</h4>
              <p className="text-xs text-gray-500 truncate">{result.address}</p>
              <div className="flex items-center gap-2 mt-1">
                {result.category && (
                  <span className="text-xs text-primary bg-primary bg-opacity-10 px-2 py-0.5 rounded">
                    {result.category}
                  </span>
                )}
                {result.distance && (
                  <span className="text-xs text-gray-400">
                    {result.distance < 1000 
                      ? `${result.distance}m` 
                      : `${(result.distance / 1000).toFixed(1)}km`
                    }
                  </span>
                )}
                {result.rating && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-gray-400">{result.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 즐겨찾기 토글 버튼 */}
          <button
            onClick={(e) => handleToggleFavorite(e, result.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="즐겨찾기 추가"
          >
            <svg className="w-4 h-4 text-gray-400 hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
});

SearchResultsList.displayName = 'SearchResultsList';

export default SearchResultsList;

import { memo } from 'react';

interface SearchResultItem {
  id: string;
  name: string;
  address: string;
  isBookmark?: boolean;
}

interface SearchResultsListProps {
  items: SearchResultItem[];
  onSelect: (item: SearchResultItem) => void;
  isLoading?: boolean;
  error?: string | null;
  total?: number;
  className?: string;
}

/**
 * 검색 결과 리스트 컴포넌트
 */
const SearchResultsList = memo<SearchResultsListProps>(({
  items,
  onSelect,
  isLoading = false,
  error = null,
  total = 0,
  className = ''
}) => {
  const handleSelect = (item: SearchResultItem) => {
    onSelect(item);
  };


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

  if (items.length === 0) {
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
      
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleSelect(item)}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleSelect(item);
          }}
          className="flex items-center justify-between py-4 px-2 bg-background border-b border-gray-100 hover:bg-primary hover:bg-opacity-10 hover:shadow-sm transition-all duration-200 cursor-pointer group touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* 장소 아이콘 */}
            <div className="w-10 h-10 bg-gray-100 group-hover:bg-primary group-hover:bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            {/* 장소 정보 */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-font text-sm truncate">{item.name}</h4>
              <p className="text-xs text-gray-500 truncate">{item.address}</p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
});

SearchResultsList.displayName = 'SearchResultsList';

export default SearchResultsList;

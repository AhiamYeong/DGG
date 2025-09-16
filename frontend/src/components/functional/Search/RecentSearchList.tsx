import { memo, useCallback } from 'react';

interface RecentSearchItem {
  id: string;
  name: string;
  address: string;
  timestamp: Date;
}

interface RecentSearchListProps {
  items: RecentSearchItem[];
  onSelect: (item: RecentSearchItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  className?: string;
}

/**
 * RecentSearchList - 최근 검색 내역 리스트 컴포넌트
 * React 19 최신 패턴 적용:
 * - memo를 활용한 성능 최적화
 * - useCallback을 통한 이벤트 핸들러 최적화
 */
const RecentSearchList = memo<RecentSearchListProps>(({
  items,
  onSelect,
  onDelete,
  onToggleFavorite,
  className = ''
}) => {
  const handleSelect = useCallback((item: RecentSearchItem) => {
    onSelect(item);
  }, [onSelect]);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  }, [onDelete]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleFavorite(id);
  }, [onToggleFavorite]);

  if (items.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">최근 검색 내역이 없습니다</p>
        <p className="text-gray-400 text-xs mt-1">검색한 장소가 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleSelect(item)}
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
              <h4 className="font-medium text-font text-sm truncate">{item.name}</h4>
              <p className="text-xs text-gray-500 truncate">{item.address}</p>
              <p className="text-xs text-gray-400 mt-1">
                {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 즐겨찾기 토글 */}
            <button
              onClick={(e) => handleToggleFavorite(e, item.id)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="즐겨찾기 추가"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* 삭제 버튼 */}
            <button
              onClick={(e) => handleDelete(e, item.id)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="삭제"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

RecentSearchList.displayName = 'RecentSearchList';

export default RecentSearchList;

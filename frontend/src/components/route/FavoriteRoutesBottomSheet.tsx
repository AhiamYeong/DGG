import { useRouteSearchStore } from '@/stores/useRouteSearchStore';
import { useBottomSheetSwipe } from '@/hooks/useBottomSheetSwipe';
// import RouteTabs from './RouteTabs';
import RouteList from './RouteList';
import EditBookmarkModal from './EditBookmarkModal';
import { useEffect, useMemo, useState } from 'react';
import type { BookmarkRoute } from '@/types/bookmark';
import type { SimpleRoute } from '@/types/route-types';

export default function FavoriteRoutesBottomSheet() {
  const {
    routeBookmarks = [],
    fetchBookmarks,
    selectBookmarkRoute
  } = useRouteSearchStore();

  // 편집 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkRoute | null>(null);

  // 컴포넌트 마운트 시 즐겨찾기 목록 로드
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);


  // BookmarkRoute를 SimpleRoute로 변환
  const convertedRoutes = useMemo((): SimpleRoute[] => {
    return routeBookmarks.map((bookmark: BookmarkRoute): SimpleRoute => {
      const routeKey = `bookmark-${bookmark.bookmarkRouteId}`;
      
      return {
        id: `bookmark-${bookmark.bookmarkRouteId}`,
        name: bookmark.name,
        totalDuration: 0, // API에서 가져올 예정
        departureTime: { hour: 0, minute: 0 }, // 현재 시간으로 설정
        arrivalTime: { hour: 0, minute: 0 }, // API에서 계산
        from: {
          latitude: 0,
          longitude: 0,
          name: bookmark.departureName,
          address: bookmark.departureName
        },
        to: {
          latitude: 0,
          longitude: 0,
          name: bookmark.destinationName,
          address: bookmark.destinationName
        },
        steps: [], // API에서 가져올 예정
        recommendationType: 'minTime',
        description: `${bookmark.departureName} → ${bookmark.destinationName}`,
        isBookmarked: true,
        bookmarkRouteId: bookmark.bookmarkRouteId, // 삭제 API 호출을 위해 추가
        fatigueLevel: 0, // API에서 가져올 예정
        createdAt: new Date(),
        updatedAt: new Date(),
        routeKey: routeKey
      };
    });
  }, [routeBookmarks]);

  // 편집 핸들러
  const handleEditRoute = (route: SimpleRoute) => {
    console.log('handleEditRoute 호출됨:', route);
    console.log('현재 routeBookmarks:', routeBookmarks);
    
    // routeKey에서 bookmarkRouteId 추출
    const bookmarkRouteId = route.routeKey?.replace('bookmark-', '');
    console.log('추출된 bookmarkRouteId:', bookmarkRouteId);
    
    if (!bookmarkRouteId) {
      console.log('bookmarkRouteId가 없음');
      return;
    }

    // bookmarkRouteId로 직접 찾기
    const bookmark = routeBookmarks.find(b => b.bookmarkRouteId === parseInt(bookmarkRouteId));
    console.log('찾은 bookmark:', bookmark);
    
    if (bookmark) {
      setEditingBookmark(bookmark);
      setIsEditModalOpen(true);
      console.log('편집 모달 열기');
    } else {
      console.log('북마크를 찾을 수 없음');
    }
  };

  // 편집 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBookmark(null);
  };

  // 즐겨찾기 이름 수정
  const handleSaveBookmark = async (bookmarkId: number, newName: string) => {
    try {
      const { favoriteRoutesApi } = await import('@/api/favoriteRoutes');
      await favoriteRoutesApi.updateRouteBookmarkName(bookmarkId, newName);
      
      // 즐겨찾기 목록 새로고침
      await fetchBookmarks();
    } catch (error) {
      console.error('즐겨찾기 이름 수정 실패:', error);
      throw error;
    }
  };

  // 즐겨찾기 토글 핸들러 (즐겨찾기 해제 후 리스트 새로고침)
  const handleToggleBookmark = (id: string) => {
    console.log('FavoriteRoutesBottomSheet: 즐겨찾기 토글', id);
    // 즐겨찾기 해제 후 리스트 새로고침
    setTimeout(() => {
      fetchBookmarks();
    }, 100); // 약간의 지연을 두어 상태 업데이트 후 새로고침
  };

  const {
    height,
    isDragging,
    touchRef,
    bind,
    toggleBottomSheet
  } = useBottomSheetSwipe({
    initialHeight: 200,
    minHeight: 120,
    maxHeight: 800, // 최대 높이 증가
    coverSearchBar: true // 검색창까지 가릴 수 있도록 설정
  });

  return (
    <div 
      ref={touchRef}
      className="w-full bg-white rounded-t-2xl shadow-lg select-none"
      style={{ 
        height: `${height}px`,
        touchAction: 'none',
        userSelect: 'none',
      }}
      {...bind()} // react-use-gesture의 bind 함수 적용
    >
      {/* 핸들 바 */}
      <div 
        className="flex justify-center py-3 cursor-pointer select-none"
        onClick={toggleBottomSheet}
      >
        <div className={`w-12 h-1 rounded-full transition-colors ${
          isDragging ? 'bg-gray-400' : 'bg-gray-300'
        }`}></div>
      </div>
      
      {/* 탭 UI */}
      {/* <RouteTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoriteCount={favoriteRoutes.length}
        // reservedCount={reservedRoutes.length}
      /> */}

      {/* 즐겨찾기 설명 */}
      <div className="px-4 py-2">
        <h3 className="text-lg font-semibold text-gray-800">즐겨찾기 경로</h3>
        <p className="text-sm text-gray-600">자주 사용하는 경로를 빠르게 선택하세요</p>
      </div>

      {/* 바텀시트 내용 */}
      <div 
        className={`transition-opacity duration-200 ${
          height > 150 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          height: `calc(${height}px - 140px)`, // 전체 높이에서 헤더 영역 제외
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch' // iOS에서 부드러운 스크롤
        }}
      >
        {convertedRoutes.length > 0 ? (
          <RouteList
            routes={convertedRoutes}
            onSelectRoute={selectBookmarkRoute}
            onToggleBookmark={handleToggleBookmark}
            onEditRoute={handleEditRoute}
            actionLabel="선택"
            showEditButton={true}
          />
        ) : (
          <div className="p-4 text-center text-gray-500">
            즐겨찾기된 경로가 없습니다.
          </div>
        )}
        {/* {activeTab === 'favorite' ? (
          <RouteList
            routes={favoriteRoutes as any}
            onSelectRoute={selectRoute as any}
            onToggleBookmark={(id) => toggleBookmark(id, 'favorite')}
            actionLabel="선택"
          />
        ) : (
          // <RouteList
          //   routes={reservedRoutes as any}
          //   onSelectRoute={selectRoute as any}
          //   onToggleBookmark={(id) => toggleBookmark(id, 'reserved')}
          //   actionLabel="선택"
          // />
          <div className="p-4 text-center text-gray-500">
            예약 기능은 준비 중입니다.
          </div>
        )} */}
      </div>

      {/* 편집 모달 */}
      <EditBookmarkModal
        isOpen={isEditModalOpen}
        bookmark={editingBookmark}
        onClose={handleCloseEditModal}
        onSave={handleSaveBookmark}
      />
    </div>
  );
}

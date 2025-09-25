import { useRouteSearchStore } from '@/stores/useRouteSearchStore';
import { useBottomSheetSwipe } from '@/hooks/useBottomSheetSwipe';
// import RouteTabs from './RouteTabs';
import RouteList from './RouteList';
import { useEffect, useMemo } from 'react';
import type { BookmarkRoute } from '@/types/bookmark';
import type { SimpleRoute } from '@/types/route-types';

export default function FavoriteRoutesBottomSheet() {
  const {
    routeBookmarks = [],
    fetchBookmarks,
    selectBookmarkRoute
  } = useRouteSearchStore();

  // 컴포넌트 마운트 시 즐겨찾기 목록 로드
  useEffect(() => {
    console.log('FavoriteRoutesBottomSheet: fetchBookmarks 호출');
    fetchBookmarks();
  }, [fetchBookmarks]);

  // 즐겨찾기 목록 변경 시 로그
  useEffect(() => {
    console.log('FavoriteRoutesBottomSheet: routeBookmarks 변경됨', routeBookmarks);
  }, [routeBookmarks]);

  // BookmarkRoute를 SimpleRoute로 변환
  const convertedRoutes = useMemo((): SimpleRoute[] => {
    return routeBookmarks.map((bookmark: BookmarkRoute): SimpleRoute => ({
      id: `bookmark-${bookmark.bookmarkRouteId}`,
      name: bookmark.name,
      totalDuration: 0, // API에서 가져올 예정
      totalDistance: 0, // API에서 가져올 예정
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
      fatigueLevel: 0, // API에서 가져올 예정
      price: 0, // API에서 가져올 예정
      createdAt: new Date(),
      updatedAt: new Date(),
      routeKey: bookmark.routeKey || `bookmark-${bookmark.bookmarkRouteId}`
    }));
  }, [routeBookmarks]);


  const {
    height,
    isDragging,
    touchRef,
    bind,
    toggleBottomSheet
  } = useBottomSheetSwipe({
    initialHeight: 120,
    minHeight: 80,
    maxHeight: 600,
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
      <div className={`overflow-y-auto transition-opacity duration-200 ${
        height > 150 ? 'opacity-100' : 'opacity-0'
      }`}>
        {convertedRoutes.length > 0 ? (
          <RouteList
            routes={convertedRoutes}
            onSelectRoute={selectBookmarkRoute}
            onToggleBookmark={() => {}} // 즐겨찾기에서 즐겨찾기 토글은 불필요
            actionLabel="선택"
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
    </div>
  );
}

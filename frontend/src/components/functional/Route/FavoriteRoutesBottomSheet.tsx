import { useRouteStore } from '../../../stores/useRouteStore';
import { useBottomSheetSwipe } from '../../../hooks/useBottomSheetSwipe';
import RouteTabs from './RouteTabs';
import RouteList from './RouteList';

export default function FavoriteRoutesBottomSheet() {
  const {
    favoriteRoutes,
    reservedRoutes,
    activeTab,
    selectRoute,
    toggleBookmark,
    setActiveTab
  } = useRouteStore();


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
      <RouteTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoriteCount={favoriteRoutes.length}
        reservedCount={reservedRoutes.length}
      />

      {/* 바텀시트 내용 */}
      <div className={`overflow-y-auto transition-opacity duration-200 ${
        height > 150 ? 'opacity-100' : 'opacity-0'
      }`}>
        {activeTab === 'favorite' ? (
          <RouteList
            routes={favoriteRoutes as any}
            onSelectRoute={selectRoute as any}
            onToggleBookmark={(id) => toggleBookmark(id, 'favorite')}
            actionLabel="선택"
          />
        ) : (
          <RouteList
            routes={reservedRoutes as any}
            onSelectRoute={selectRoute as any}
            onToggleBookmark={(id) => toggleBookmark(id, 'reserved')}
            actionLabel="선택"
          />
        )}
      </div>
    </div>
  );
}

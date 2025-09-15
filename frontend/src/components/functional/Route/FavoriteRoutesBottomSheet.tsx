import { useRouteStore } from '../../../stores/useRouteStore';
import { useBottomSheetSwipe } from '../../../hooks/useBottomSheetSwipe';

export default function FavoriteRoutesBottomSheet() {
  const {
    favoriteRoutes,
    selectRoute,
    addFavoriteRoute
  } = useRouteStore();

  const addNewRoute = () => {
    console.log('새 경로 추가');
    // TODO: 새 경로 추가 모달 열기
  };

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
        // 공식 문서 권장: 터치 제스처 제어
        touchAction: 'none', // 모든 터치 제스처 제어
        // 공식 문서 권장: 텍스트 선택 방지
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        // 공식 문서 권장: 네이티브 드래그 방지
        WebkitUserDrag: 'none' as const,
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        // 공식 문서 권장: 포인터 이벤트 최적화
        pointerEvents: 'auto',
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
      
             {/* 헤더 */}
             <div className="px-6 pb-4">
               <h3 className="text-lg font-semibold text-font">즐겨찾기 & 예약 노선</h3>
               <p className="text-sm text-secondary">자주 이용하는 경로를 빠르게 선택하세요</p>
             </div>

      {/* 바텀시트 내용 */}
      <div className={`px-6 pb-6 overflow-y-auto transition-opacity duration-200 ${
        height > 150 ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* 즐겨찾기 노선 목록 */}
        <div className="space-y-3">
          {favoriteRoutes.map((route) => (
                   <div
                     key={route.id}
                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-secondary hover:bg-opacity-20 transition-colors cursor-pointer"
                   >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-font">{route.name}</h4>
                  {route.isBookmarked && (
                    <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20" data-testid="star-icon">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span className="font-medium">{route.from}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-medium">{route.to}</span>
                </div>
                <div className="text-xs text-secondary mt-1">
                  예약 시간: {route.time}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-secondary hover:text-font transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => selectRoute(route)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  선택
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 새 경로 추가 버튼 */}
        <button 
          onClick={addNewRoute}
          className="w-full mt-4 p-4 border-2 border-dashed border-secondary rounded-lg text-secondary hover:border-primary hover:text-primary transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            새 경로 추가
          </div>
        </button>
      </div>
    </div>
  );
}

import React, { useState, useCallback, useEffect } from 'react';
import type { SimpleRoute } from '@/types/route-types';
import { SUBWAY_LINE_COLORS } from '@/constants';

interface SideSheetProps {
  position: number; // 0, 20, 70 (0: 닫힘, 20: 보통상태, 70: 확장상태)
  route: SimpleRoute;
  onPositionChange: (position: number) => void;
  onClose?: () => void; // 선택적 prop으로 변경
  headerHeight?: number; // 헤더 높이 (기본값: 0)
}

/**
 * 네비게이션 중 왼쪽에서 나타나는 사이드 시트
 * - 2단계 상태: 보통상태(20%), 확장상태(70%)
 * - 보통상태: 출발-도착 노드 간 선으로 연결된 간단한 경로 표시
 * - 확장상태: 노드 간 상세정보가 포함된 전체 경로 표시
 */
export const SideSheet: React.FC<SideSheetProps> = ({
  position,
  route,
  onPositionChange,
  headerHeight = 0,
}) => {
  const [startX, setStartX] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // 스크롤 드래그 상태
  const [scrollStartY, setScrollStartY] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);
  const [scrollStartTop, setScrollStartTop] = useState(0);
  const [isScrollDragging, setIsScrollDragging] = useState(false);
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);
  const [gestureType, setGestureType] = useState<'none' | 'scroll' | 'resize'>('none');

  // 드래그 시작 핸들러
  const handleDragStart = useCallback((clientX: number) => {
    setStartX(clientX);
    setStartPosition(position);
    setIsDragging(true);
  }, [position]);

  // 드래그 이동 핸들러
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startX;
    const newPosition = Math.max(20, Math.min(70, startPosition + (deltaX / window.innerWidth) * 100));
    onPositionChange(newPosition);
  }, [isDragging, startX, startPosition, onPositionChange]);

  // 제스처 타입 결정 함수
  const determineGestureType = useCallback((deltaX: number, deltaY: number) => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // 수평 이동이 더 크면 사이드바 크기 조절
    if (absX > absY && absX > 10) {
      return 'resize';
    }
    // 수직 이동이 더 크면 스크롤
    if (absY > absX && absY > 10) {
      return 'scroll';
    }
    return 'none';
  }, []);

  // 스크롤 드래그 시작 핸들러
  const handleScrollDragStart = useCallback((clientX: number, clientY: number) => {
    if (!scrollContainer) return;
    setScrollStartX(clientX);
    setScrollStartY(clientY);
    setScrollStartTop(scrollContainer.scrollTop);
    setGestureType('none');
  }, [scrollContainer]);

  // 스크롤 드래그 이동 핸들러
  const handleScrollDragMove = useCallback((clientX: number, clientY: number) => {
    if (!scrollContainer) return;
    
    const deltaX = clientX - scrollStartX;
    const deltaY = clientY - scrollStartY;
    
    // 제스처 타입이 결정되지 않았다면 결정
    if (gestureType === 'none') {
      const newGestureType = determineGestureType(deltaX, deltaY);
      setGestureType(newGestureType);
      
      if (newGestureType === 'resize') {
        // 사이드바 크기 조절로 전환
        setIsScrollDragging(false);
        setIsDragging(true);
        setStartX(scrollStartX);
        setStartPosition(position);
        // 사이드바 크기 조절 이벤트 트리거
        handleDragMove(clientX);
        return;
      } else if (newGestureType === 'scroll') {
        setIsScrollDragging(true);
        return;
      }
    }
    
    // 스크롤 제스처인 경우에만 스크롤 처리
    if (gestureType === 'scroll' && isScrollDragging) {
      const newScrollTop = Math.max(0, scrollStartTop - deltaY);
      scrollContainer.scrollTop = newScrollTop;
    }
  }, [scrollContainer, scrollStartX, scrollStartY, scrollStartTop, gestureType, isScrollDragging, determineGestureType, position]);

  // 스크롤 드래그 종료 핸들러
  const handleScrollDragEnd = useCallback(() => {
    setIsScrollDragging(false);
    setGestureType('none');
  }, []);

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    // 드래그 종료 시 스냅 로직: 20% 또는 70%로 스냅
    const currentPosition = position;
    const snapThreshold = 10; // 10% 임계값
    
    if (currentPosition < 20 + snapThreshold) {
      onPositionChange(20); // 20%로 스냅
    } else if (currentPosition > 70 - snapThreshold) {
      onPositionChange(70); // 70%로 스냅
    } else {
      // 중간 지점을 기준으로 스냅
      const midPoint = (20 + 70) / 2; // 45%
      if (currentPosition < midPoint) {
        onPositionChange(20);
      } else {
        onPositionChange(70);
      }
    }
  }, [position, onPositionChange]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // React 터치 이벤트에서는 preventDefault() 호출하지 않음
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // 스크롤용 터치 이벤트 핸들러
  const handleScrollTouchStart = useCallback((e: React.TouchEvent) => {
    // 제스처 타입이 결정되기 전까지는 이벤트 전파 허용
    handleScrollDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleScrollDragStart]);

  const handleScrollTouchMove = useCallback((e: TouchEvent) => {
    // 제스처 타입이 결정되었거나 스크롤 드래그 중일 때만 이벤트 차단
    if (gestureType === 'scroll' || isScrollDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleScrollDragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, [gestureType, isScrollDragging, handleScrollDragMove]);

  const handleScrollTouchEnd = useCallback(() => {
    if (gestureType === 'resize' || isDragging) {
      handleDragEnd();
    }
    handleScrollDragEnd();
  }, [gestureType, isDragging, handleDragEnd, handleScrollDragEnd]);

  // 전역 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging && position > 0) { // SideSheet가 접혀있을 때는 전역 이벤트 리스너 등록하지 않음
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, position, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // 스크롤 드래그 이벤트 리스너 등록/해제
  useEffect(() => {
    if ((gestureType !== 'none' || isScrollDragging || isDragging) && position > 0) { // SideSheet가 접혀있을 때는 전역 이벤트 리스너 등록하지 않음
      document.addEventListener('touchmove', handleScrollTouchMove, { passive: false });
      document.addEventListener('touchend', handleScrollTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleScrollTouchMove);
      document.removeEventListener('touchend', handleScrollTouchEnd);
    };
  }, [gestureType, isScrollDragging, isDragging, position, handleScrollTouchMove, handleScrollTouchEnd]);


  if (position === 0) return null;

  // 확장 비율 계산 (0: 20% 상태, 1: 70% 상태)
  const expansionRatio = (position - 20) / 50; // 20에서 70까지의 비율

  // 통합된 UI (position에 따라 동적 조정)
  const renderUnifiedUI = () => {
    // 간선 길이 계산 (20%: 12px, 70%: 40px)
    const lineHeight = 12 + (expansionRatio * 28);
    
    // 상세 정보 표시 여부 (드래그 중에는 숨김)
    const showDetails = expansionRatio > 0.6;
    
    // 노드와 간선 사이의 간격 (드래그 도중 늘어나는 부분)
    const nodeSpacing = 4 + (expansionRatio * 16);

    return (
      <div className="flex flex-col h-full">
        {/* 헤더와의 연결을 위한 상단 패딩 */}
        <div style={{ height: `${headerHeight}px` }} className="bg-white/95 backdrop-blur-sm border-b border-gray-200" />
        
        {/* 경로 다이어그램 */}
        <div 
          ref={setScrollContainer}
          className={`flex-1 ${showDetails ? 'px-6 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : 'flex justify-center items-center'}`} 
          style={showDetails ? { 
            maxHeight: 'calc(100vh - 200px)',
            touchAction: 'pan-y'
          } : {}}
          onTouchStart={showDetails ? handleScrollTouchStart : undefined}
        >
          <div className="flex flex-col">
            {/* 출발 노드와 정보 */}
            <div className="flex items-center py-2" style={{ gap: `${nodeSpacing}px` }}>
              {/* 왼쪽: 노드 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs">🏁</span>
                </div>
              </div>
              
              {/* 오른쪽: 상세 정보 */}
              <div 
                className="flex-1 transition-all duration-300 ease-out"
                style={{
                  opacity: showDetails ? 1 : 0,
                  transform: showDetails ? 'translateX(0)' : 'translateX(-10px)',
                  willChange: 'opacity, transform'
                }}
              >
                {showDetails && (
                  <p className="text-sm font-medium text-gray-900">{route.from.name || route.from.address || '출발지'}</p>
                )}
              </div>
            </div>

            {/* 첫 번째 간선 */}
            <div className="flex items-center py-1" style={{ gap: `${nodeSpacing}px` }}>
              <div className="w-8 flex justify-center">
                <div 
                  className="w-px bg-gray-300" 
                  style={{ height: `${lineHeight}px` }}
                ></div>
              </div>
              <div 
                className="flex-1 transition-all duration-300 ease-out"
                style={{
                  opacity: showDetails ? 1 : 0,
                  transform: showDetails ? 'scaleX(1)' : 'scaleX(0)',
                  willChange: 'opacity, transform'
                }}
              >
                {showDetails && (
                  <div className="h-px bg-gray-300"></div>
                )}
              </div>
            </div>

            {/* 경로 단계들을 노드로 표시 */}
            {(route.steps && route.steps.length > 0 ? route.steps : [
              { id: '1', type: 'subway', description: '2호선 이용', duration: 20, lineInfo: { name: '2호선', direction: '강남방향', stationCount: 8 } },
              { id: '2', type: 'transfer', description: '사당역에서 4호선으로 환승', duration: 3, transferInfo: { fromLine: '2호선', toLine: '4호선', station: '사당역' } },
              { id: '3', type: 'subway', description: '4호선 이용', duration: 15, lineInfo: { name: '4호선', direction: '삼각지방향', stationCount: 5 } },
              { id: '4', type: 'transfer', description: '삼각지역에서 6호선으로 환승', duration: 3, transferInfo: { fromLine: '4호선', toLine: '6호선', station: '삼각지역' } },
              { id: '5', type: 'subway', description: '6호선 이용', duration: 8, lineInfo: { name: '6호선', direction: '공덕방향', stationCount: 2 } }
            ]).map((step: any, index: number) => (
              <div key={step.id}>
                {/* 노드와 상세 정보 */}
                <div className="flex items-center py-2" style={{ gap: `${nodeSpacing}px` }}>
                  {/* 왼쪽: 노드 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.type === 'walk' ? 'bg-gray-300' :
                      step.type === 'bus' ? 'bg-green-500' :
                      step.type === 'subway' ? '' :
                      step.type === 'transfer' ? 'bg-gray-300' :
                      'bg-gray-400'
                    }`} style={step.type === 'subway' && step.lineInfo?.name ? {
                      backgroundColor: SUBWAY_LINE_COLORS[step.lineInfo.name as keyof typeof SUBWAY_LINE_COLORS] || SUBWAY_LINE_COLORS['기타']
                    } : {}}>
                      {step.type === 'walk' && (
                        <span className="text-xs">🚶</span>
                      )}
                      {step.type === 'bus' && (
                        <span className="text-xs">🚌</span>
                      )}
                      {step.type === 'subway' && (
                        <span className="text-xs font-bold text-white">
                          {step.lineInfo?.name?.replace('호선', '') || '🚇'}
                        </span>
                      )}
                      {step.type === 'transfer' && (
                        <span className="text-xs">🔄</span>
                      )}
                    </div>
                  </div>
                  
                  {/* 오른쪽: 상세 정보 */}
                  <div 
                    className="flex-1 transition-all duration-300 ease-out"
                    style={{
                      opacity: showDetails ? 1 : 0,
                      transform: showDetails ? 'translateX(0)' : 'translateX(-10px)',
                      willChange: 'opacity, transform'
                    }}
                  >
                    {showDetails && (
                      <>
                        {step.type !== 'transfer' && (
                          <p className="text-sm font-medium text-gray-900">{step.description}</p>
                        )}
                        {step.duration && step.duration > 0 && step.type !== 'transfer' && (
                          <p className="text-xs text-gray-500">{step.duration}분 소요</p>
                        )}
                        {step.lineInfo && (
                          <p className="text-xs text-gray-500">
                            {step.lineInfo.direction} {step.lineInfo.stationCount && `(${step.lineInfo.stationCount}개역)`}
                          </p>
                        )}
                        {step.transferInfo && (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              {step.transferInfo.fromLine} → {step.transferInfo.toLine}
                            </p>
                            <p className="text-xs text-gray-500">환승 소요시간 {step.duration}분</p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 간선 (마지막 단계가 아닌 경우) */}
                {index < (route.steps && route.steps.length > 0 ? route.steps.length : 5) - 1 && (
                  <div className="flex items-center py-1" style={{ gap: `${nodeSpacing}px` }}>
                    <div className="w-8 flex justify-center">
                      <div 
                        className="w-px bg-gray-300" 
                        style={{ height: `${lineHeight}px` }}
                      ></div>
                    </div>
                    <div 
                      className="flex-1 transition-all duration-300 ease-out"
                      style={{
                        opacity: showDetails ? 1 : 0,
                        transform: showDetails ? 'scaleX(1)' : 'scaleX(0)',
                        willChange: 'opacity, transform'
                      }}
                    >
                      {showDetails && (
                        <div className="h-px bg-gray-300"></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 마지막 간선 */}
            <div className="flex items-center py-1" style={{ gap: `${nodeSpacing}px` }}>
              <div className="w-8 flex justify-center">
                <div 
                  className="w-px bg-gray-300" 
                  style={{ height: `${lineHeight}px` }}
                ></div>
              </div>
              <div 
                className="flex-1 transition-all duration-300 ease-out"
                style={{
                  opacity: showDetails ? 1 : 0,
                  transform: showDetails ? 'scaleX(1)' : 'scaleX(0)',
                  willChange: 'opacity, transform'
                }}
              >
                {showDetails && (
                  <div className="h-px bg-gray-300"></div>
                )}
              </div>
            </div>

            {/* 도착 노드와 정보 */}
            <div className="flex items-center py-2" style={{ gap: `${nodeSpacing}px` }}>
              {/* 왼쪽: 노드 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs">🎯</span>
                </div>
              </div>
              
              {/* 오른쪽: 상세 정보 */}
              <div 
                className="flex-1 transition-all duration-300 ease-out"
                style={{
                  opacity: showDetails ? 1 : 0,
                  transform: showDetails ? 'translateX(0)' : 'translateX(-10px)',
                  willChange: 'opacity, transform'
                }}
              >
                {showDetails && (
                  <p className="text-sm font-medium text-gray-900">{route.to.name || route.to.address || '도착지'}</p>
                )}
              </div>
            </div>
          </div>

            {/* 경로 요약 정보 (확장 상태일 때만 표시) */}
            {showDetails && (
              <div 
                className="mt-6 transition-all duration-300 ease-out"
                style={{
                  opacity: showDetails ? 1 : 0,
                  transform: showDetails ? 'translateY(0)' : 'translateY(10px)',
                  willChange: 'opacity, transform'
                }}
              >
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">총 소요시간</span>
                    <span className="text-lg font-bold text-gray-900">{route.totalDuration || 0}분</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">총 거리</span>
                    <span className="text-lg font-bold text-gray-900">{((route.totalDistance || 0) / 1000).toFixed(1)}km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">예상 요금</span>
                    <span className="text-lg font-bold text-gray-900">{(route.price || 0).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  };


  return (
    <>
      {/* 백드롭 */}
      {position > 0 && (
        <div
          className="absolute bg-black bg-opacity-20 transition-opacity pointer-events-none"
          style={{ 
            zIndex: 10,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: (position / 70) * 0.3 
          }}
        />
      )}
      
      {/* 사이드 시트 */}
      <div
        className="absolute bg-white shadow-2xl transition-transform duration-200 ease-out"
        style={{
          zIndex: 20,
          left: 0,
          width: `${position}%`,
          top: 0,
          height: '100%',
          borderRadius: '0 12px 12px 0',
        }}
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
      >
        
        {/* 통합된 UI 렌더링 */}
        {renderUnifiedUI()}
      </div>
    </>
  );
};

export default SideSheet;
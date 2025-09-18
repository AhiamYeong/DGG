import React, { useState, useCallback, useEffect } from 'react';
import type { SimpleRoute } from '../../../types/route-types';

interface SideSheetProps {
  position: number; // 0, 20, 70 (0: 닫힘, 20: 보통상태, 70: 확장상태)
  route: SimpleRoute;
  onPositionChange: (position: number) => void;
  onClose: () => void;
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
  onClose,
  headerHeight = 0,
}) => {
  const [startX, setStartX] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  // 전역 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
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
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);


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
        {/* 경로 다이어그램 */}
        <div className={`flex-1 ${showDetails ? 'px-6 py-4' : 'flex justify-center items-center'}`}>
          <div className="flex flex-col">
            {/* 출발 노드와 정보 */}
            <div className="flex items-center py-2" style={{ gap: `${nodeSpacing}px` }}>
              {/* 왼쪽: 노드 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">출발</span>
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
                  <p className="text-sm font-medium text-gray-900">{route.from.name}</p>
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
              { id: '1', type: 'walk', description: '출발지에서 지하철역까지', duration: 3 },
              { id: '2', type: 'subway', description: '2호선 이용', duration: 20, lineInfo: { name: '2호선', direction: '강남방향', stationCount: 8 } },
              { id: '3', type: 'walk', description: '지하철역에서 도착지까지', duration: 2 }
            ]).map((step, index) => (
              <div key={step.id}>
                {/* 노드와 상세 정보 */}
                <div className="flex items-center py-2" style={{ gap: `${nodeSpacing}px` }}>
                  {/* 왼쪽: 노드 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.type === 'walk' ? 'bg-gray-300' :
                      step.type === 'bus' ? 'bg-green-500' :
                      step.type === 'subway' ? 'bg-blue-500' :
                      'bg-orange-500'
                    }`}>
                      {step.type === 'walk' && (
                        <span className="text-xs font-medium text-gray-700">걷기</span>
                      )}
                      {step.type === 'bus' && (
                        <span className="text-xs font-medium text-white">버스</span>
                      )}
                      {step.type === 'subway' && (
                        <span className="text-xs font-medium text-white">
                          {step.lineInfo?.name || '지하철'}
                        </span>
                      )}
                      {step.type === 'transfer' && (
                        <span className="text-xs font-medium text-white">환승</span>
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
                        <p className="text-sm font-medium text-gray-900">{step.description}</p>
                        {step.duration && (
                          <p className="text-xs text-gray-500">{step.duration}분 소요</p>
                        )}
                        {step.lineInfo && (
                          <p className="text-xs text-gray-500">
                            {step.lineInfo.direction} {step.lineInfo.stationCount && `(${step.lineInfo.stationCount}개역)`}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 간선 (마지막 단계가 아닌 경우) */}
                {index < (route.steps && route.steps.length > 0 ? route.steps.length : 3) - 1 && (
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
                  <span className="text-xs font-medium text-gray-700">도착</span>
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
                  <p className="text-sm font-medium text-gray-900">{route.to.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* 경로 요약 정보 (확장 상태일 때만 표시) */}
          <div 
            className="mt-6 transition-all duration-300 ease-out"
            style={{
              opacity: showDetails ? 1 : 0,
              transform: showDetails ? 'translateY(0)' : 'translateY(10px)',
              willChange: 'opacity, transform'
            }}
          >
            {showDetails && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">총 소요시간</span>
                  <span className="text-lg font-bold text-gray-900">{route.totalDuration}분</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">총 거리</span>
                  <span className="text-lg font-bold text-gray-900">{(route.totalDistance / 1000).toFixed(1)}km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">예상 요금</span>
                  <span className="text-lg font-bold text-gray-900">{(route.price || 0).toLocaleString()}원</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <>
      {/* 백드롭 */}
      {position > 0 && (
        <div
          className="fixed bg-black bg-opacity-20 transition-opacity"
          style={{ 
            zIndex: 12, // 안내종료 버튼(z-15)보다 아래
            top: `${headerHeight}px`,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: (position / 70) * 0.3 
          }}
          onClick={onClose}
        />
      )}
      
      {/* 사이드 시트 */}
      <div
        className="fixed bg-white shadow-2xl transition-transform duration-200 ease-out"
        style={{
          zIndex: 25, // 안내종료 버튼(z-20)보다 위에 위치
          left: 0,
          width: `${position}%`, // position 값에 따라 동적 너비 조정 (20% ~ 70%)
          top: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight}px)`,
          borderRadius: '0 12px 12px 0', // 오른쪽 모서리만 둥글게
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
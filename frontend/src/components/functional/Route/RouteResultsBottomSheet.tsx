import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
// import { useBottomSheetSwipe } from '../../../hooks/useBottomSheetSwipe';
import RouteList from './RouteList';
import type { SimpleRoute } from '../../../types/route-types';

interface RouteResultsBottomSheetProps {
  open: boolean;
  onClose: () => void;
  routes: SimpleRoute[];
  actionLabel: string;
  onSelect: (route: SimpleRoute) => void;
}

/**
 * 경로 추천 결과 바텀시트 컴포넌트
 */
export default function RouteResultsBottomSheet({
  open,
  onClose,
  routes,
  actionLabel,
  onSelect
}: RouteResultsBottomSheetProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  
  // 바텀시트 스와이프 훅 사용 (임시로 비활성화)
  // const { 
  //   isDragging, 
  //   dragY, 
  //   handleTouchStart, 
  //   handleTouchMove, 
  //   handleTouchEnd,
  //   resetPosition 
  // } = useBottomSheetSwipe({
  //   onClose,
  //   threshold: 100
  // });

  // ESC 키로 닫기
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      onClose();
    }
  }, [open, onClose]);

  // 포커스 트랩
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (!open || e.key !== 'Tab') return;
    
    const modal = modalRef.current;
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [open]);

  // 모달 열릴 때 포커스 관리
  useEffect(() => {
    if (open) {
      // 현재 포커스된 요소 저장
      triggerRef.current = document.activeElement as HTMLElement;
      
      // 이벤트 리스너 추가
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);
      
      // 모달 내부 첫 번째 요소에 포커스
      setTimeout(() => {
        const modal = modalRef.current;
        if (modal) {
          const firstFocusable = modal.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          firstFocusable?.focus();
        }
      }, 100);
      
      // 바디 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 이벤트 리스너 제거
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
      
      // 바디 스크롤 복원
      document.body.style.overflow = '';
      
      // 트리거 버튼으로 포커스 복귀
      if (triggerRef.current) {
        triggerRef.current.focus();
        triggerRef.current = null;
      }
      
      // 드래그 위치 리셋
      // resetPosition();
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown, handleFocusTrap]);

  // 백드롭 클릭으로 닫기
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-results-title"
      style={{ paddingTop: '96px' }} // 검색창 높이만큼 여백 (top-24 = 96px)
    >
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* 바텀시트 */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl transform transition-all duration-300 ease-out animate-slide-up"
        style={{
          // transform: `translateY(${Math.max(0, dragY)}px)`,
          maxHeight: 'calc(100vh - 140px)' // 검색창 높이를 고려한 최대 높이
        }}
        // onTouchStart={handleTouchStart}
        // onTouchMove={handleTouchMove}
        // onTouchEnd={handleTouchEnd}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* 헤더 */}
        <div className="px-4 pb-4 border-b border-gray-200">
          <h2 id="route-results-title" className="text-lg font-semibold text-font">
            경로 추천 결과
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {routes.length}개의 경로를 찾았습니다
          </p>
        </div>
        
        {/* 탭 영역 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex">
            <button
              className="flex-1 py-3 px-4 text-sm font-medium text-primary border-b-2 border-primary bg-white"
              aria-selected="true"
              role="tab"
            >
              추천 경로
            </button>
          </div>
        </div>
        
        {/* 내용 영역 */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="bg-white">
            {routes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">추천 경로가 없습니다</p>
                <p className="text-gray-400 text-xs mt-1">다른 출발지나 도착지를 시도해보세요</p>
              </div>
            ) : (
              <RouteList
                routes={routes}
                onSelectRoute={onSelect}
                actionLabel={actionLabel}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}



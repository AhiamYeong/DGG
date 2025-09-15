import { useState, useRef, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';

interface UseBottomSheetSwipeProps {
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  coverSearchBar?: boolean; // 검색창까지 가릴지 여부
}

export function useBottomSheetSwipe({
  initialHeight = 120,
  minHeight = 80,
  maxHeight = 400,
  coverSearchBar = false
}: UseBottomSheetSwipeProps = {}) {
  // 검색창까지 가리려면 화면 높이의 85%까지 확장
  const calculatedMaxHeight = coverSearchBar 
    ? Math.min(maxHeight, window.innerHeight * 0.85)
    : maxHeight;
  const [height, setHeight] = useState(initialHeight);
  const [isDragging, setIsDragging] = useState(false);
  const touchRef = useRef<HTMLDivElement>(null);

  // react-use-gesture의 useDrag 훅 사용 (공식 문서 기준)
  const bind = useDrag(
    ({ down, offset: [, oy], last, first }) => {
      if (first) {
        setIsDragging(true);
      }
      
      if (down) {
        // 드래그 중: initialHeight에서 oy만큼 빼서 새로운 높이 계산
        // oy는 위로 드래그하면 음수, 아래로 드래그하면 양수
        const newHeight = Math.max(minHeight, Math.min(calculatedMaxHeight, initialHeight - oy));
        setHeight(newHeight);
      } else if (last) {
        // 드래그 종료 시 스냅 로직
        setIsDragging(false);
        
        const snapThreshold = 50;
        const currentHeight = Math.max(minHeight, Math.min(calculatedMaxHeight, initialHeight - oy));
        
        if (currentHeight < minHeight + snapThreshold) {
          setHeight(minHeight);
        } else if (currentHeight > calculatedMaxHeight - snapThreshold) {
          setHeight(calculatedMaxHeight);
        } else if (currentHeight < (minHeight + calculatedMaxHeight) / 2) {
          setHeight(minHeight);
        } else {
          setHeight(calculatedMaxHeight);
        }
      }
    },
    {
      axis: 'y', // Y축으로만 드래그 허용
      bounds: { top: -(calculatedMaxHeight - minHeight), bottom: 0 }, // 드래그 범위 제한
      rubberband: true, // 경계에서 탄성 효과
      filterTaps: true, // 탭과 드래그 구분
      preventScroll: true, // 스크롤 방지 (공식 문서 권장)
      preventScrollAxis: 'y', // Y축 스크롤만 방지
      // 공식 문서 권장: 터치 디바이스 최적화
      pointer: {
        touch: true, // 터치 이벤트 강제 활성화
        capture: true, // 포인터 캡처 활성화
        mouse: false, // 마우스 이벤트 비활성화 (터치 우선)
      },
      // 공식 문서 권장: 더 민감한 드래그 감지
      axisThreshold: { touch: 0, mouse: 0, pen: 0 }, // 임계값 낮춤
      // 공식 문서 권장: preventDefault 활성화
      preventDefault: true, // 기본 동작 방지
      // 공식 문서 권장: 이벤트 옵션 설정
      eventOptions: { passive: false }, // passive 이벤트 비활성화
      // 공식 문서 권장: threshold 설정 (개발자 모드에서 더 민감하게)
      threshold: [0, 0], // 최소 이동 거리 0으로 설정
    }
  );

  const toggleBottomSheet = useCallback(() => {
    setHeight(height === minHeight ? calculatedMaxHeight : minHeight);
  }, [height, minHeight, calculatedMaxHeight]);

  const openBottomSheet = useCallback(() => {
    setHeight(calculatedMaxHeight);
  }, [calculatedMaxHeight]);

  const closeBottomSheet = useCallback(() => {
    setHeight(minHeight);
  }, [minHeight]);

  return {
    height,
    isDragging,
    touchRef,
    bind, // react-use-gesture의 bind 함수
    toggleBottomSheet,
    openBottomSheet,
    closeBottomSheet
  };
}
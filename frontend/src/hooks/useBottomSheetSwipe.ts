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

  // react-use-gesture의 useDrag 훅 사용 (간소화된 설정)
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
import { useRef, useCallback, useEffect, useState } from 'react';

interface EventCleanupItem {
  element: Element | Window | Document;
  eventName: string;
  handler: EventListener;
  options?: AddEventListenerOptions;
}

/**
 * 통합 이벤트 관리 훅
 * 모든 이벤트 리스너, 타이머, 애니메이션 프레임을 통합 관리
 */
export function useEventManager() {
  const eventsRef = useRef<EventCleanupItem[]>([]);
  const timersRef = useRef<Set<NodeJS.Timeout | number>>(new Set());
  const framesRef = useRef<Set<number>>(new Set());

  const addEventListener = useCallback((
    element: Element | Window | Document,
    eventName: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => {
    element.addEventListener(eventName, handler, options);
    
    eventsRef.current.push({
      element,
      eventName,
      handler,
      options
    });
  }, []);

  const removeEventListener = useCallback((
    element: Element | Window | Document,
    eventName: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => {
    element.removeEventListener(eventName, handler, options);
    
    eventsRef.current = eventsRef.current.filter(
      event => !(
        event.element === element &&
        event.eventName === eventName &&
        event.handler === handler
      )
    );
  }, []);

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const timer = global.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    
    timersRef.current.add(timer);
    return timer;
  }, []);

  const setInterval = useCallback((callback: () => void, delay: number) => {
    const timer = global.setInterval(callback, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const clearTimer = useCallback((timer: NodeJS.Timeout | number) => {
    if (typeof timer === 'number') {
      global.clearTimeout(timer);
    } else {
      global.clearTimeout(timer);
    }
    timersRef.current.delete(timer);
  }, []);

  const requestAnimationFrame = useCallback((callback: FrameRequestCallback) => {
    const frame = global.requestAnimationFrame((time) => {
      framesRef.current.delete(frame);
      callback(time);
    });
    
    framesRef.current.add(frame);
    return frame;
  }, []);

  const cancelAnimationFrame = useCallback((frame: number) => {
    global.cancelAnimationFrame(frame);
    framesRef.current.delete(frame);
  }, []);

  const cleanup = useCallback(() => {
    // 이벤트 리스너 정리
    eventsRef.current.forEach(({ element, eventName, handler, options }) => {
      element.removeEventListener(eventName, handler, options);
    });
    eventsRef.current = [];

    // 타이머 정리
    timersRef.current.forEach(timer => {
      if (typeof timer === 'number') {
        global.clearTimeout(timer);
      } else {
        global.clearTimeout(timer);
      }
    });
    timersRef.current.clear();

    // 애니메이션 프레임 정리
    framesRef.current.forEach(frame => {
      global.cancelAnimationFrame(frame);
    });
    framesRef.current.clear();
  }, []);

  // 컴포넌트 언마운트 시 자동 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    addEventListener,
    removeEventListener,
    setTimeout,
    setInterval,
    clearTimer,
    requestAnimationFrame,
    cancelAnimationFrame,
    cleanup
  };
}

/**
 * 드래그 이벤트 관리 훅
 * 마우스/터치 드래그 이벤트를 안전하게 관리
 */
export function useDragEventManager(
  onDragStart?: (event: MouseEvent | TouchEvent) => void,
  onDragMove?: (event: MouseEvent | TouchEvent) => void,
  onDragEnd?: (event: MouseEvent | TouchEvent) => void
) {
  const eventManager = useEventManager();
  const isDraggingRef = useRef(false);
  const [, forceUpdate] = useState({});

  const handleMouseDown = useCallback((event: MouseEvent) => {
    isDraggingRef.current = true;
    forceUpdate({});
    onDragStart?.(event);
    
    const handleMouseMove = (e: Event) => {
      if (isDraggingRef.current) {
        onDragMove?.(e as MouseEvent);
      }
    };
    
    const handleMouseUp = (e: Event) => {
      isDraggingRef.current = false;
      forceUpdate({});
      onDragEnd?.(e as MouseEvent);
      
      // 이벤트 리스너 제거
      eventManager.removeEventListener(document, 'mousemove', handleMouseMove);
      eventManager.removeEventListener(document, 'mouseup', handleMouseUp);
    };
    
    // 이벤트 리스너 등록
    eventManager.addEventListener(document, 'mousemove', handleMouseMove);
    eventManager.addEventListener(document, 'mouseup', handleMouseUp);
  }, [onDragStart, onDragMove, onDragEnd, eventManager]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    isDraggingRef.current = true;
    forceUpdate({});
    onDragStart?.(event);
    
    const handleTouchMove = (e: Event) => {
      if (isDraggingRef.current) {
        (e as TouchEvent).preventDefault(); // 스크롤 방지
        onDragMove?.(e as TouchEvent);
      }
    };
    
    const handleTouchEnd = (e: Event) => {
      isDraggingRef.current = false;
      forceUpdate({});
      onDragEnd?.(e as TouchEvent);
      
      // 이벤트 리스너 제거
      eventManager.removeEventListener(document, 'touchmove', handleTouchMove, { passive: false });
      eventManager.removeEventListener(document, 'touchend', handleTouchEnd);
    };
    
    // 이벤트 리스너 등록
    eventManager.addEventListener(document, 'touchmove', handleTouchMove, { passive: false });
    eventManager.addEventListener(document, 'touchend', handleTouchEnd);
  }, [onDragStart, onDragMove, onDragEnd, eventManager]);

  return {
    handleMouseDown,
    handleTouchStart,
    isDragging: isDraggingRef.current
  };
}

/**
 * 스크롤 이벤트 관리 훅
 * 스크롤 이벤트를 디바운스/쓰로틀링으로 최적화
 */
export function useScrollEventManager(
  onScroll: (event: Event) => void,
  options: {
    throttle?: number;
    debounce?: number;
    element?: Element | Window | Document;
  } = {}
) {
  const eventManager = useEventManager();
  const { throttle = 16, debounce, element = window } = options;
  
  const lastScrollTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback((event: Event) => {
    const now = Date.now();
    
    // 쓰로틀링
    if (now - lastScrollTime.current < throttle) {
      return;
    }
    lastScrollTime.current = now;
    
    // 디바운싱
    if (debounce) {
      if (scrollTimeout.current) {
        eventManager.clearTimer(scrollTimeout.current);
      }
      
      scrollTimeout.current = eventManager.setTimeout(() => {
        onScroll(event);
      }, debounce);
    } else {
      onScroll(event);
    }
  }, [onScroll, throttle, debounce, eventManager]);

  // 스크롤 이벤트 등록
  eventManager.addEventListener(element, 'scroll', handleScroll, { passive: true });

  return {
    cleanup: () => {
      if (scrollTimeout.current) {
        eventManager.clearTimer(scrollTimeout.current);
      }
    }
  };
}

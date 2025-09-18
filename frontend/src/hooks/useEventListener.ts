import { useEffect, useRef } from 'react';

/**
 * 이벤트 리스너 관리를 위한 커스텀 훅
 * 메모리 누수 방지 및 최적화
 */

interface UseEventListenerOptions {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
}

/**
 * 안전한 이벤트 리스너 훅
 * @param eventName 이벤트 이름
 * @param handler 이벤트 핸들러
 * @param element 이벤트를 등록할 요소 (기본: window)
 * @param options 이벤트 옵션
 */
export function useEventListener<T extends keyof WindowEventMap>(
  eventName: T,
  handler: (event: WindowEventMap[T]) => void,
  element: Element | Window | Document | null = window,
  options: UseEventListenerOptions = {}
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      handlerRef.current(event as WindowEventMap[T]);
    };

    const eventOptions = {
      capture: options.capture,
      passive: options.passive,
      once: options.once
    };

    element.addEventListener(eventName, eventListener, eventOptions);

    return () => {
      element.removeEventListener(eventName, eventListener, eventOptions);
    };
  }, [eventName, element, options.capture, options.passive, options.once]);
}

/**
 * 키보드 이벤트 리스너 훅
 * @param handler 키보드 이벤트 핸들러
 * @param element 이벤트를 등록할 요소 (기본: document)
 * @param options 이벤트 옵션
 */
export function useKeyboardListener(
  handler: (event: KeyboardEvent) => void,
  element: Element | Window | Document | null = document,
  options: UseEventListenerOptions = {}
) {
  useEventListener('keydown', handler, element, options);
}

/**
 * 마우스 이벤트 리스너 훅
 * @param handler 마우스 이벤트 핸들러
 * @param element 이벤트를 등록할 요소 (기본: window)
 * @param options 이벤트 옵션
 */
export function useMouseListener(
  handler: (event: MouseEvent) => void,
  element: Element | Window | Document | null = window,
  options: UseEventListenerOptions = {}
) {
  useEventListener('mousemove', handler, element, options);
}

/**
 * 터치 이벤트 리스너 훅
 * @param handler 터치 이벤트 핸들러
 * @param element 이벤트를 등록할 요소 (기본: window)
 * @param options 이벤트 옵션
 */
export function useTouchListener(
  handler: (event: TouchEvent) => void,
  element: Element | Window | Document | null = window,
  options: UseEventListenerOptions = {}
) {
  useEventListener('touchmove', handler, element, options);
}

/**
 * 리사이즈 이벤트 리스너 훅
 * @param handler 리사이즈 이벤트 핸들러
 * @param element 이벤트를 등록할 요소 (기본: window)
 * @param options 이벤트 옵션
 */
export function useResizeListener(
  handler: (event: UIEvent) => void,
  element: Element | Window | Document | null = window,
  options: UseEventListenerOptions = {}
) {
  useEventListener('resize', handler, element, options);
}

/**
 * 스크롤 이벤트 리스너 훅
 * @param handler 스크롤 이벤트 핸들러
 * @param element 이벤트를 등록할 요소 (기본: window)
 * @param options 이벤트 옵션
 */
export function useScrollListener(
  handler: (event: Event) => void,
  element: Element | Window | Document | null = window,
  options: UseEventListenerOptions = {}
) {
  useEventListener('scroll', handler, element, options);
}

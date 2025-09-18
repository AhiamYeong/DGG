import { useCallback, useMemo, useRef } from 'react';

/**
 * 성능 최적화를 위한 커스텀 훅들
 */

/**
 * 이벤트 핸들러를 안정적으로 메모이제이션하는 훅
 * @param handler 이벤트 핸들러 함수
 * @param deps 의존성 배열
 * @returns 메모이제이션된 핸들러
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  handler: T,
  deps: React.DependencyList
): T {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  return useCallback(
    ((...args: any[]) => handlerRef.current(...args)) as T,
    deps
  );
}

/**
 * 객체를 안정적으로 메모이제이션하는 훅
 * @param obj 메모이제이션할 객체
 * @param deps 의존성 배열
 * @returns 메모이제이션된 객체
 */
export function useStableMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * 배열을 안정적으로 메모이제이션하는 훅
 * @param factory 배열을 생성하는 함수
 * @param deps 의존성 배열
 * @returns 메모이제이션된 배열
 */
export function useStableArray<T>(
  factory: () => T[],
  deps: React.DependencyList
): T[] {
  return useMemo(factory, deps);
}

/**
 * 조건부 렌더링을 위한 메모이제이션 훅
 * @param condition 조건
 * @param trueValue 조건이 true일 때 반환할 값
 * @param falseValue 조건이 false일 때 반환할 값
 * @returns 메모이제이션된 값
 */
export function useConditionalMemo<T>(
  condition: boolean,
  trueValue: T,
  falseValue: T
): T {
  return useMemo(() => condition ? trueValue : falseValue, [condition, trueValue, falseValue]);
}

/**
 * 디바운스된 콜백을 생성하는 훅
 * @param callback 디바운스할 콜백
 * @param delay 지연 시간 (ms)
 * @param deps 의존성 배열
 * @returns 디바운스된 콜백
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...deps]
  );
}

/**
 * 쓰로틀된 콜백을 생성하는 훅
 * @param callback 쓰로틀할 콜백
 * @param delay 지연 시간 (ms)
 * @param deps 의존성 배열
 * @returns 쓰로틀된 콜백
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay, ...deps]
  );
}

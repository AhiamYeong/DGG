import { useState, useEffect } from 'react';

/**
 * 디바운스 훅
 * @param value 디바운스할 값
 * @param delay 지연 시간 (밀리초)
 * @returns 디바운스된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 타이머 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업 함수 - 컴포넌트 언마운트나 값 변경 시 이전 타이머 제거
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 검색용 디바운스 훅 (검색어 전용)
 * @param searchQuery 검색어
 * @param delay 지연 시간 (기본 300ms)
 * @returns 디바운스된 검색어
 */
export function useSearchDebounce(searchQuery: string, delay: number = 300): string {
  return useDebounce(searchQuery, delay);
}

export default useDebounce;

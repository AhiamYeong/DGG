import { useCallback } from 'react';

/**
 * 지도 검색 기능을 담당하는 커스텀 훅
 * 길찾기 검색 처리
 */
export function useMapSearch() {
  // 길찾기 검색 처리
  const handleSearch = useCallback((origin: string, destination: string, waypoints?: string[]) => {
    console.log('길찾기 검색:', { origin, destination, waypoints });
    // TODO: 실제 길찾기 API 호출 및 경로 표시
    if (waypoints && waypoints.length > 0) {
      console.log('경유지 포함:', waypoints);
    }
  }, []);

  return {
    handleSearch
  };
}

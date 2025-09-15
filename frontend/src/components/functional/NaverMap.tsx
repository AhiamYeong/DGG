import { useEffect, useRef } from 'react';
import type { NaverMapLocation, NaverMapProps } from '../../types/naver-map';

interface NaverMapComponentProps extends NaverMapProps {
  mapRef: React.RefObject<HTMLDivElement>;
  isLoaded: boolean;
  onInitialize: (center: NaverMapLocation, zoom?: number) => void;
  onCleanup: () => void;
}

export default function NaverMap({
  width = '100%',
  height = '100vh',
  center = { lat: 37.5665, lng: 126.9780 },
  zoom = 15,
  mapRef,
  isLoaded,
  onInitialize,
  onCleanup
}: NaverMapComponentProps) {
  const isInitialized = useRef(false);
  
  // 지도 초기화는 한 번만 실행
  useEffect(() => {
    if (!isInitialized.current) {
      onInitialize(center, zoom);
      isInitialized.current = true;
    }
    
    return () => {
      onCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 한 번만 실행 (의도적으로 center, zoom, onInitialize, onCleanup 제외)

  return (
    <div className="w-full h-full">
      <div 
        ref={mapRef} 
        style={{ width, height }}
        className="w-full h-full"
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}

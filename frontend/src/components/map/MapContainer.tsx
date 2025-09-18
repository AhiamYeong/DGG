import React, { memo } from 'react';
import NaverMap from '../functional/NaverMap';
import type { NaverMapLocation } from '../../types/map';

interface MapContainerProps {
  currentLocation: NaverMapLocation;
  mapRef: React.RefObject<HTMLDivElement>;
  isLoaded: boolean;
  onInitialize: (center: NaverMapLocation, zoom?: number) => void;
  onCleanup: () => void;
}

/**
 * 지도 컨테이너 컴포넌트
 * 네이버 지도를 렌더링하는 기본 컨테이너
 * React.memo로 불필요한 리렌더링 방지
 */
export const MapContainer = memo<MapContainerProps>(({
  currentLocation,
  mapRef,
  isLoaded,
  onInitialize,
  onCleanup
}) => {
  return (
    <div className="absolute inset-0 z-0">
      <NaverMap 
        center={currentLocation}
        height="100vh"
        width="100%"
        mapRef={mapRef}
        isLoaded={isLoaded}
        onInitialize={onInitialize}
        onCleanup={onCleanup}
      />
    </div>
  );
});

export default MapContainer;

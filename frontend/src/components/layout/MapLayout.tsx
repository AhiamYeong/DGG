import { memo, ReactNode } from 'react';

interface MapLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * 지도 레이아웃 컴포넌트
 * 지도 화면의 기본 레이아웃을 제공
 */
export const MapLayout = memo<MapLayoutProps>(({ children, className = '' }) => {
  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      {children}
    </div>
  );
});

export default MapLayout;

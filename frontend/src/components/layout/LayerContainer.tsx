import { memo, ReactNode } from 'react';

interface LayerContainerProps {
  children: ReactNode;
  zIndex?: number;
  className?: string;
  pointerEvents?: 'auto' | 'none';
}

/**
 * 레이어 컨테이너 컴포넌트
 * z-index와 pointer-events를 관리하는 레이어 컨테이너
 */
export const LayerContainer = memo<LayerContainerProps>(({ 
  children, 
  zIndex = 0, 
  className = '',
  pointerEvents = 'auto'
}) => {
  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{ 
        zIndex,
        pointerEvents: pointerEvents === 'none' ? 'none' : 'auto'
      }}
    >
      {children}
    </div>
  );
});

export default LayerContainer;

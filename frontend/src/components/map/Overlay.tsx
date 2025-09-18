import { memo, ReactNode } from 'react';

type OverlayVariant = 'modal' | 'toast' | 'backdrop';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface OverlayProps {
  children: ReactNode;
  variant: OverlayVariant;
  
  // 공통 props
  isOpen?: boolean;
  isVisible?: boolean;
  className?: string;
  
  // Modal props
  onClose?: () => void;
  backdropClassName?: string;
  
  // Toast props
  position?: ToastPosition;
  
  // Backdrop props
  onClick?: () => void;
}

/**
 * 통합 오버레이 컴포넌트
 * Modal, Toast, Backdrop 오버레이를 variant prop으로 구분
 */
export const Overlay = memo<OverlayProps>(({ 
  children, 
  variant,
  isOpen = true,
  isVisible = true,
  className = '',
  onClose,
  backdropClassName,
  position = 'top-right',
  onClick
}) => {
  // Modal variant
  if (variant === 'modal') {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 배경 오버레이 */}
        <div 
          className={`absolute inset-0 ${backdropClassName || 'bg-black bg-opacity-50'}`}
          onClick={onClose}
        />
        
        {/* 모달 콘텐츠 */}
        <div className={`relative z-10 ${className}`}>
          {children}
        </div>
      </div>
    );
  }
  
  // Toast variant
  if (variant === 'toast') {
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    
    return (
      <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
        {children}
      </div>
    );
  }
  
  // Backdrop variant
  if (variant === 'backdrop') {
    if (!isVisible) return null;
    
    return (
      <div className="absolute inset-0 z-20">
        {/* 백드롭 */}
        <div 
          className={`absolute inset-0 ${backdropClassName || 'bg-black bg-opacity-30'}`}
          onClick={onClick}
        />
        
        {/* 콘텐츠 */}
        <div className={`relative z-10 ${className}`}>
          {children}
        </div>
      </div>
    );
  }
  
  return null;
});

export default Overlay;

import React, { memo } from 'react';
import { Icon } from '../ui';

interface MapButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  variant: 'location' | 'polyline' | 'remove' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
  disabled?: boolean;
}

/**
 * 지도용 특화 버튼 컴포넌트
 * 다양한 variant와 size를 지원하는 지도 컨트롤 버튼
 * React.memo로 불필요한 리렌더링 방지
 */
export const MapButton = memo<MapButtonProps>(({
  onClick,
  icon,
  variant,
  size = 'md',
  className = '',
  title,
  disabled = false
}) => {
  // Variant별 스타일 정의
  const variantStyles = {
    location: 'bg-white hover:bg-secondary hover:bg-opacity-20 text-font',
    polyline: 'bg-blue-500 hover:bg-blue-600 text-white',
    remove: 'bg-red-500 hover:bg-red-600 text-white',
    custom: ''
  };

  // Size별 스타일 정의
  const sizeStyles = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  // 기본 스타일
  const baseStyles = 'rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // 포커스 링 색상
  const focusRingStyles = {
    location: 'focus:ring-gray-400',
    polyline: 'focus:ring-blue-400',
    remove: 'focus:ring-red-400',
    custom: 'focus:ring-gray-400'
  };

  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${focusRingStyles[variant]}
    ${className}
  `.trim();

  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      title={title}
      disabled={disabled}
      aria-label={title}
    >
      {icon}
    </button>
  );
});

/**
 * 아이콘 이름으로 MapButton을 생성하는 헬퍼 컴포넌트
 */
interface IconMapButtonProps extends Omit<MapButtonProps, 'icon'> {
  iconName: 'location' | 'search' | 'close' | 'favorite' | 'route' | 'options' | 'arrow-right' | 'clock' | 'trash' | 'plus' | 'info' | 'warning' | 'error' | 'success' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'menu' | 'bookmark' | 'star' | 'heart' | 'calendar' | 'time' | 'distance' | 'price' | 'bus' | 'subway' | 'walk' | 'transfer';
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const IconMapButton = memo<IconMapButtonProps>(({
  iconName,
  iconSize = 'lg',
  ...props
}) => {
  return (
    <MapButton
      {...props}
      icon={<Icon name={iconName} size={iconSize} />}
    />
  );
});

export default MapButton;

import { memo } from 'react';

interface IconProps {
  name: 'location' | 'search' | 'close' | 'favorite' | 'route' | 'options' | 'arrow-right' | 'clock' | 'trash' | 'plus' | 'info' | 'warning' | 'error' | 'success' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'menu' | 'bookmark' | 'star' | 'heart' | 'calendar' | 'time' | 'distance' | 'price' | 'bus' | 'subway' | 'walk' | 'transfer';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fill?: 'none' | 'current' | 'inherit';
  strokeWidth?: number;
}

/**
 * 재사용 가능한 Icon 컴포넌트
 * 프로젝트 전체에서 사용되는 SVG 아이콘들을 통합 관리
 * React.memo로 불필요한 리렌더링 방지
 */
export const Icon = memo<IconProps>(({ 
  name, 
  size = 'md', 
  className = '', 
  fill = 'none',
  strokeWidth = 2 
}) => {
  // Size 클래스 정의
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // Fill 클래스 정의
  const fillClasses = {
    none: 'fill-none',
    current: 'fill-current',
    inherit: 'fill-inherit'
  };

  // 아이콘 경로 정의
  const iconPaths = {
    location: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    search: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
    close: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M6 18L18 6M6 6l12 12" />
    ),
    favorite: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
    route: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    ),
    options: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    ),
    'arrow-right': (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    ),
    'arrow-left': (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M15 19l-7-7 7-7" />
    ),
    'arrow-up': (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M5 15l7-7 7 7" />
    ),
    'arrow-down': (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M19 9l-7 7-7-7" />
    ),
    clock: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    trash: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    ),
    plus: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    ),
    info: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    warning: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    error: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    success: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    menu: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M4 6h16M4 12h16M4 18h16" />
    ),
    bookmark: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    ),
    star: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    ),
    heart: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    time: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    distance: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    ),
    price: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    ),
    bus: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    ),
    subway: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    ),
    walk: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
    transfer: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    )
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${fillClasses[fill]} ${className}`} 
      fill={fill === 'none' ? 'none' : 'currentColor'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {iconPaths[name]}
    </svg>
  );
});

export default Icon;

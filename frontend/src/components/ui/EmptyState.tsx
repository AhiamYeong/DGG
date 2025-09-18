import { memo } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'search' | 'history' | 'favorite';
  className?: string;
}

/**
 * EmptyState - 빈 데이터 상태 표시 컴포넌트
 * React 19 최신 패턴 적용:
 * - memo를 활용한 성능 최적화
 * - 접근성(a11y) 고려한 UI 구성
 */
const EmptyState = memo<EmptyStateProps>(({
  title,
  description,
  icon = 'search',
  className = ''
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'history':
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        );
      case 'favorite':
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        );
      case 'search':
      default:
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        );
    }
  };

  return (
    <div className={`text-center py-8 ${className}`}>
      {/* 빈 상태 아이콘 */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {getIcon()}
        </svg>
      </div>
      
      {/* 제목 */}
      <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
      
      {/* 설명 */}
      {description && (
        <p className="text-gray-400 text-xs">{description}</p>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;

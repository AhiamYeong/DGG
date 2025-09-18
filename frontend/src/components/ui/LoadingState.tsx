import { memo } from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * LoadingState - 로딩 상태 표시 컴포넌트
 * React 19 최신 패턴 적용:
 * - memo를 활용한 성능 최적화
 * - 접근성(a11y) 고려한 UI 구성
 */
const LoadingState = memo<LoadingStateProps>(({
  message = '로딩 중...',
  className = ''
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      {/* 로딩 스피너 */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg 
          className="w-8 h-8 text-primary animate-spin" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </div>
      
      {/* 로딩 메시지 */}
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
});

LoadingState.displayName = 'LoadingState';

export default LoadingState;

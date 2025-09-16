import { memo } from 'react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorState - 에러 상태 표시 컴포넌트
 * React 19 최신 패턴 적용:
 * - memo를 활용한 성능 최적화
 * - 접근성(a11y) 고려한 UI 구성
 */
const ErrorState = memo<ErrorStateProps>(({
  error,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      {/* 에러 아이콘 */}
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      {/* 에러 메시지 */}
      <p className="text-red-500 text-sm font-medium mb-2">오류가 발생했습니다</p>
      <p className="text-gray-400 text-xs mb-4">{error}</p>
      
      {/* 재시도 버튼 */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary hover:opacity-90 transition-opacity"
          aria-label="다시 시도"
        >
          다시 시도
        </button>
      )}
    </div>
  );
});

ErrorState.displayName = 'ErrorState';

export default ErrorState;

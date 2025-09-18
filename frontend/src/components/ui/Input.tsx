import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'search' | 'readonly';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClear?: () => void;
  showClear?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
}

/**
 * 재사용 가능한 Input 컴포넌트
 * 다양한 variant와 기능을 지원하는 입력 필드 컴포넌트
 */
export const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  onClear,
  showClear = false,
  className = '',
  error = false,
  helperText,
  ...props
}) => {
  // Size 스타일
  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  // Variant 스타일
  const variantStyles = {
    default: 'bg-white border border-gray-300 focus:border-primary focus:ring-primary',
    search: 'bg-white border border-secondary focus:border-primary focus:ring-primary cursor-pointer',
    readonly: 'bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed'
  };

  // 에러 스타일
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  // 기본 스타일
  const baseStyles = 'w-full rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';

  // 아이콘 패딩 조정
  const iconPadding = icon && iconPosition === 'left' ? 'pl-9' : '';
  const clearPadding = showClear ? 'pr-8' : '';

  const inputClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${errorStyles}
    ${iconPadding}
    ${clearPadding}
    ${className}
  `.trim();

  return (
    <div className="relative">
      {/* 왼쪽 아이콘 */}
      {icon && iconPosition === 'left' && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}

      {/* 입력 필드 */}
      <input
        className={inputClasses}
        {...props}
      />

      {/* 오른쪽 아이콘 또는 클리어 버튼 */}
      {(icon && iconPosition === 'right') || showClear ? (
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          {showClear && props.value && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="입력 내용 지우기"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {icon && iconPosition === 'right' && !showClear && (
            <div className="pointer-events-none">
              {icon}
            </div>
          )}
        </div>
      ) : null}

      {/* 도움말 텍스트 */}
      {helperText && (
        <p className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * 검색 입력 필드 컴포넌트
 */
interface SearchInputProps extends Omit<InputProps, 'variant' | 'icon'> {
  onSearch?: () => void;
  searchIcon?: React.ReactNode;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  searchIcon,
  className = '',
  ...props
}) => {
  const defaultSearchIcon = (
    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const handleClick = () => {
    onSearch?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSearch?.();
    }
  };

  return (
    <Input
      variant="search"
      icon={searchIcon || defaultSearchIcon}
      iconPosition="left"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      readOnly
      className={`cursor-pointer ${className}`}
      {...props}
    />
  );
};

/**
 * 위치 입력 필드 컴포넌트
 */
interface LocationInputProps extends Omit<SearchInputProps, 'searchIcon'> {
  type: 'origin' | 'destination' | 'waypoint';
  waypointIndex?: number;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  type,
  waypointIndex,
  className = '',
  ...props
}) => {
  const locationIcon = (
    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const getPlaceholder = () => {
    switch (type) {
      case 'origin':
        return '출발지 검색';
      case 'destination':
        return '도착지 검색';
      case 'waypoint':
        return `경유지 ${waypointIndex ? waypointIndex + 1 : ''} 검색`;
      default:
        return '검색';
    }
  };

  return (
    <SearchInput
      searchIcon={locationIcon}
      placeholder={getPlaceholder()}
      className={className}
      {...props}
    />
  );
};

export default Input;
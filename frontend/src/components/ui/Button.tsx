import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

/**
 * 재사용 가능한 Button 컴포넌트
 * 다양한 variant와 size를 지원하는 버튼 컴포넌트
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  // Variant 스타일
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white disabled:border-gray-300 disabled:text-gray-400',
    ghost: 'text-gray-600 hover:bg-gray-100 disabled:text-gray-400',
    icon: 'p-2 hover:bg-gray-100 rounded-full transition-colors'
  };

  // Size 스타일
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2'
  };

  // 기본 스타일
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed';

  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `.trim();

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

/**
 * 아이콘 버튼 컴포넌트
 */
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'icon',
  size = 'icon',
  className = '',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {icon}
    </Button>
  );
};

/**
 * 탭 버튼 컴포넌트
 */
interface TabButtonProps extends Omit<ButtonProps, 'variant'> {
  active?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({
  active = false,
  children,
  className = '',
  ...props
}) => {
  const activeStyles = active
    ? 'bg-primary text-white'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200';

  return (
    <Button
      variant="ghost"
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeStyles} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default Button;
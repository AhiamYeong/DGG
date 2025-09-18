import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  isActive,
  onClick,
  children,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default TabButton;

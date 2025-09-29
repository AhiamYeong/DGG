import React from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

/**
 * 확인 다이얼로그 컴포넌트
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = '예',
  cancelText = '아니오',
  onConfirm,
  onCancel,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      
      {/* 다이얼로그 */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 mx-4 max-w-sm w-full">
        {/* 제목 */}
        <h3 className="text-lg font-semibold text-font mb-2">
          {title}
        </h3>
        
        {/* 메시지 */}
        <p className="text-secondary mb-6">
          {message}
        </p>
        
        {/* 버튼들 */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            variant="secondary"
            size="sm"
            className="px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            size="sm"
            className="px-4 py-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;


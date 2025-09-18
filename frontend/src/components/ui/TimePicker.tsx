import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getMinTime, formatTime, getActionLabel } from '@/utils/timeUtils';
import { Button } from './Button';

interface TimePickerProps {
  isOpen: boolean;
  departureTime: Date;
  onTimeChange: (time: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 출발 시간 선택 모달 컴포넌트
 * - 시간 선택기 (DatePicker)
 * - 확인/취소 버튼
 */
export const TimePicker: React.FC<TimePickerProps> = ({
  isOpen,
  departureTime,
  onTimeChange,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* 모달 배경 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000]" onClick={onCancel} />
      
      {/* 모달 컨텐츠 - 하단에서 올라오는 형태 */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[10001] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">출발 시간 선택</h3>
          <Button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        {/* 타임픽커 컨텐츠 */}
        <div className="px-6 py-8 pb-12">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">원하는 출발 시간을 선택해주세요</p>
            <p className="text-sm text-gray-500">현재 시간: {formatTime(new Date())}</p>
          </div>
          
          <div className="mb-8 flex justify-center">
            <DatePicker
              selected={departureTime}
              onChange={(date) => date && onTimeChange(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="시간"
              dateFormat="HH:mm"
              minDate={new Date()}
              minTime={getMinTime()}
              maxTime={new Date(new Date().setHours(23, 59, 0, 0))}
              className="w-full max-w-xs p-4 border border-gray-300 rounded-xl text-center text-xl font-medium"
              placeholderText="시간을 선택하세요"
              filterTime={(time) => {
                return time.getTime() >= getMinTime().getTime();
              }}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              size="lg"
              className="flex-1 py-4"
            >
              취소
            </Button>
            <Button
              onClick={onConfirm}
              variant="primary"
              size="lg"
              className="flex-1 py-4"
            >
              {getActionLabel(departureTime, 'schedule')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimePicker;

import React from 'react';
import type { RouteStep } from '@/types/route-types';

interface RouteStepDetailProps {
  step: RouteStep;
  stepNumber: number;
  isActive?: boolean;
}

/**
 * 경로 단계별 상세 정보 컴포넌트
 */
export const RouteStepDetail: React.FC<RouteStepDetailProps> = ({
  step,
  stepNumber,
  isActive = false
}) => {
  // 교통수단별 아이콘과 색상
  const getTransportInfo = (type: string) => {
    switch (type) {
      case 'walk':
        return {
          icon: '🚶',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      case 'subway':
        return {
          icon: '🚇',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'bus':
        return {
          icon: '🚌',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'transfer':
        return {
          icon: '🔄',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      default:
        return {
          icon: '📍',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const transportInfo = getTransportInfo(step.type);

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
      isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-white border border-gray-200'
    }`}>
      {/* 단계 번호 및 아이콘 */}
      <div className="flex flex-col items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {stepNumber}
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${transportInfo.bgColor}`}>
          {transportInfo.icon}
        </div>
      </div>

      {/* 경로 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${transportInfo.color}`}>
            {step.type === 'walk' && '도보'}
            {step.type === 'subway' && '지하철'}
            {step.type === 'bus' && '버스'}
            {step.type === 'transfer' && '환승'}
          </span>
          {step.lineInfo && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {step.lineInfo.name}
            </span>
          )}
          {step.duration && (
            <span className="text-xs text-gray-500">
              {step.duration}분
            </span>
          )}
        </div>

        <div className="text-sm text-gray-700 mb-1">
          {step.description}
        </div>

        {/* 출발/도착 정보 */}
        {(step.from || step.to) && (
          <div className="text-xs text-gray-500 space-y-1">
            {step.from && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>출발: {step.from.name}</span>
              </div>
            )}
            {step.to && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>도착: {step.to.name}</span>
              </div>
            )}
          </div>
        )}

        {/* 시간 정보 */}
        {(step.departureTime || step.arrivalTime) && (
          <div className="text-xs text-gray-500 mt-2 flex gap-4">
            {step.departureTime && (
              <span>출발: {step.departureTime.hour.toString().padStart(2, '0')}:{step.departureTime.minute.toString().padStart(2, '0')}</span>
            )}
            {step.arrivalTime && (
              <span>도착: {step.arrivalTime.hour.toString().padStart(2, '0')}:{step.arrivalTime.minute.toString().padStart(2, '0')}</span>
            )}
          </div>
        )}

        {/* 혼잡도 정보 */}
        {step.congestionLevel && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">혼잡도:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      (step.congestionLevel === 'low' && level <= 1) ||
                      (step.congestionLevel === 'medium' && level <= 2) ||
                      (step.congestionLevel === 'high' && level <= 3)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {step.congestionLevel === 'low' && '여유'}
                {step.congestionLevel === 'medium' && '보통'}
                {step.congestionLevel === 'high' && '혼잡'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteStepDetail;

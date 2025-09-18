import React from 'react';
import { formatTime } from '@/utils/timeUtils';
import type { SimpleRoute } from '@/types/route-types';

interface RouteInfoProps {
  route: SimpleRoute;
  currentStepIndex: number;
}

/**
 * 네비게이션 중 상단에 표시되는 경로 정보 컴포넌트
 * - 총 소요 시간, 도착 예정 시간
 * - 예상 피로도
 * - 사이드 시트 토글 버튼
 */
export const RouteInfo: React.FC<RouteInfoProps> = ({
  route,
  currentStepIndex,
}) => {
  const currentStep = route.steps[currentStepIndex];
  const remainingSteps = route.steps.length - currentStepIndex - 1;

  // 피로도에 따른 색상 결정
  const getFatigueColor = (level: number) => {
    if (level <= 30) return 'bg-green-500';
    if (level <= 60) return 'bg-yellow-500';
    if (level <= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="px-4 py-3">
        {/* 상단 정보 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                {route.totalDuration}분
              </span>
              <span className="text-sm text-gray-500">
                {formatTime(route.departureTime)} ~ {formatTime(route.arrivalTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">예상 피로도</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getFatigueColor(route.fatigueLevel || 0)}`}
                  style={{ width: `${route.fatigueLevel || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {route.fatigueLevel || 0}%
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
          
        </div>

        {/* 현재 단계 정보 */}
        {currentStep && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              {currentStep.type === 'walk' && (
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
              {currentStep.type === 'bus' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">버스</span>
                </div>
              )}
              {currentStep.type === 'subway' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: currentStep.lineInfo?.color || '#0066CC' }}>
                  <span className="text-white text-xs font-bold">{currentStep.lineInfo?.name || '지하철'}</span>
                </div>
              )}
              {currentStep.type === 'transfer' && (
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{currentStep.description}</p>
              {currentStep.duration && (
                <p className="text-xs text-gray-500">{currentStep.duration}분 소요</p>
              )}
            </div>
            {remainingSteps > 0 && (
              <div className="text-xs text-gray-500">
                {remainingSteps}단계 남음
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteInfo;

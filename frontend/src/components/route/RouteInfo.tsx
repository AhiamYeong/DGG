import React from 'react';
import { formatTime } from '@/utils/timeUtils';
import { SUBWAY_LINE_COLORS, getFatigueLevel } from '@/constants';
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

  // 피로도 레벨 정보 가져오기
  const fatigueInfo = getFatigueLevel(route.fatigueLevel || 0);

  return (
    <div className="relative z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="px-6 py-4">
        {/* 출발지 → 도착지 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-base text-gray-600 mb-2">
              <span className="font-semibold">{route.from.name || route.from.address || '출발지'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-semibold">{route.to.name || route.to.address || '도착지'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {route.totalDuration}분
              </span>
              <span className="text-base text-gray-500">
                {formatTime(route.departureTime)} ~ {formatTime(route.arrivalTime)}
              </span>
            </div>
          </div>
        </div>

        {/* 피로도 정보 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-base text-gray-600">예상 피로도</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-32">
            <div
              className="h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${route.fatigueLevel || 0}%`,
                backgroundColor: fatigueInfo.color
              }}
            />
          </div>
          <span className="text-base font-semibold text-gray-700">
            레벨{fatigueInfo.level} ({fatigueInfo.label})
          </span>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ 
                  backgroundColor: currentStep.lineInfo?.name 
                    ? SUBWAY_LINE_COLORS[currentStep.lineInfo.name as keyof typeof SUBWAY_LINE_COLORS] || SUBWAY_LINE_COLORS['기타']
                    : '#0066CC' 
                }}>
                  <span className="text-white text-xs font-bold">
                    {currentStep.lineInfo?.name?.replace('호선', '') || '🚇'}
                  </span>
                </div>
              )}
              {currentStep.type === 'transfer' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔄</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900">{currentStep.description}</p>
              {currentStep.duration && (
                <p className="text-sm text-gray-500">{currentStep.duration}분 소요</p>
              )}
            </div>
            {remainingSteps > 0 && (
              <div className="text-sm text-gray-500">
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

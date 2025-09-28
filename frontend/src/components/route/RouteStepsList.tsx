import React from 'react';
import type { RouteStep } from '@/types/route-types';
import RouteStepDetail from './RouteStepDetail';

interface RouteStepsListProps {
  steps: RouteStep[];
  currentStepIndex?: number;
  className?: string;
}

/**
 * 경로 단계 목록 컴포넌트
 */
export const RouteStepsList: React.FC<RouteStepsListProps> = ({
  steps,
  currentStepIndex = -1,
  className = ''
}) => {
  if (!steps || steps.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>경로 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {steps.map((step, index) => (
        <RouteStepDetail
          key={step.id || `step-${index}`}
          step={step}
          stepNumber={index + 1}
          isActive={index === currentStepIndex}
        />
      ))}
    </div>
  );
};

export default RouteStepsList;

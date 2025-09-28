/**
 * 피로도 관리 및 통계 관련 API
 *
 * 기능:
 * - 메인페이지 피로도 조회
 * - 피로도 업데이트 (커피, 걷기, 낮잠)
 * - 피로도 하루/일주일 히스토리 조회
 * - 걸음 수 통계 조회
 * - 피로도 설문조사
 *
 * 사용 페이지:
 * - MainPage: 현재 피로도 표시
 * - FatiguePage: 피로도 관리 및 히스토리
 * - FatigueButtons: 피로도 업데이트 버튼
 * - WeeklyBarChart: 일주일 통계 차트
 *
 * @format
 */

import { createApiClient } from "../utils/apiClient";

const API_BASE_URL = "http://localhost:8080/api/v1/";
export const fatigueApi = createApiClient(API_BASE_URL);

// 메인페이지 피로도 조회
export interface MainFatigueProps {
  nickname: string;
  current_fatigue: number;
}

// 피로도 업데이트
export interface fatigueUpdateRequest {
  reason: "COFFEE" | "WALK" | "NAP";
  fatigueChange: number;
}

export interface fatigueUpdateResponse {
  createdAt: string;
  reason: "COFFEE" | "WALK" | "NAP";
  fatigue: number;
  fatigueChange: number;
}

// 피로도 하루 히스토리 조회
export interface fatigueHistory {
  fatigueId: number;
  created_at: string;
  reason: string;
  fatigue: number;
  fatigueChange: number;
}

// 피로도 일주일 통계 조회
export interface fatigueDataProps {
  day: string;
  fatigue: number;
}

export interface fatigueDashboardProps {
  nickname: string;
  fatigueRank: number; // 사용자 중 상위 퍼센트
  data: fatigueDataProps[];
}

// 걸음 수 일주일 통계 조회
export interface footStepDataProps {
  day: string;
  footStep: number;
}

export interface footStepDashboardProps {
  nickname: string;
  data: footStepDataProps[];
}

/** 피로도 설문조사 */
// 설문조사 응답 interface
export interface SurveyAnswerProps {
  surveyQuestionId: number;
  answerValue: number;
}

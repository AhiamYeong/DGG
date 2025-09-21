/** @format */

// src/api/mypageApi.ts
import { createApiClient } from "../utils/apiClient";

const API_BASE_URL = "https://j13a305.p.ssafy.io/api/v1/";
export const mypageApi = createApiClient(API_BASE_URL);

// 기본 정보 interface
export interface InfoProps {
  nickname: string;
  email: string;
}

// 설문조사 응답 interface
export interface SurveyAnswerProps {
  surveyQuestionId: number;
  answerValue: number;
}

// 알람 설정 interface
export interface AlarmSettingsProps {
  generalEnabled: boolean;
  sleepEnabled: boolean;
}

/** @format */

import {
  fatigueHistory,
  fatigueUpdateRequest,
  fatigueUpdateResponse,
  MainFatigueProps,
  fatigueDashboardProps,
  footStepDashboardProps,
  footStepDataProps,
  fatigueDataProps,
  SurveyAnswerProps,
} from "@/api/fatigueApi";
import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://j13a305.p.ssafy.io/api/v1";
const NICKNAME = "애옹";

// Helper function to format date to 'YYYY-MM-DD HH:MM:SS'
const formatDate = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
};

// Generate dynamic timestamps based on the current time for a more realistic demo
const now = new Date();
const mockTimestamps = {
  walk: formatDate(new Date(now.getTime() - 30 * 60 * 1000)), // 30 minutes ago
  coffee: formatDate(new Date(now.getTime() - 1 * 60 * 60 * 1000)), // 2 hours ago
  traffic: formatDate(new Date(now.getTime() - 2 * 60 * 60 * 1000)), // 4 hours ago
};

let fatigue: MainFatigueProps = {
  nickname: NICKNAME,
  current_fatigue: 30,
};

const mockFatigueHistories: fatigueHistory[] = [
  {
    fatigueId: 1,
    created_at: mockTimestamps.traffic,
    reason: "TRAFFIC", // 출근길 교통체증으로 피로도 증가
    fatigue: 45,
    fatigue_change: +45,
  },
  {
    fatigueId: 2,
    created_at: mockTimestamps.coffee,
    reason: "COFFEE", // 커피 마셔서 피로도 감소
    fatigue: 35,
    fatigue_change: -10,
  },
  {
    fatigueId: 3,
    created_at: mockTimestamps.walk,
    reason: "WALK", // 점심 먹고 산책해서 피로도 감소
    fatigue: 30,
    fatigue_change: -5,
  },
];

const fatigueData: fatigueDataProps[] = [
  { day: "mon", fatigue: 20 },
  { day: "tue", fatigue: 35 },
  { day: "wed", fatigue: 10 },
  { day: "thu", fatigue: 80 },
  { day: "fri", fatigue: 90 },
  { day: "sat", fatigue: 30 },
  { day: "sun", fatigue: 45 },
];

const fatigueDashboardData: fatigueDashboardProps = {
  nickname: NICKNAME,
  fatigue_rank: 4,
  data: fatigueData,
};

const footStepData: footStepDataProps[] = [
  { day: "mon", foot_step: 1500 },
  { day: "tue", foot_step: 2500 },
  { day: "wed", foot_step: 1500 },
  { day: "thu", foot_step: 3000 },
  { day: "fri", foot_step: 6500 },
  { day: "sat", foot_step: 400 },
  { day: "sun", foot_step: 300 },
];

const footStepDashboardData: footStepDashboardProps = {
  nickname: NICKNAME,
  data: footStepData,
};

export const fatigueHandler = [
  // 피로도 조회
  http.get(`${API_BASE_URL}/fatigues`, () => {
    return HttpResponse.json(fatigue);
  }),

  // 피로도 수정 로직 (감소)
  http.put(`${API_BASE_URL}/fatigues`, async ({ request }) => {
    const body = (await request.json()) as fatigueUpdateRequest;

    // 피로도가 0 이하고, 또 감소시키려고 하면 아무 작업도 수행하지 않습니다.
    if (fatigue.current_fatigue <= 0 && body.fatigue_change < 0) {
      const resp: fatigueUpdateResponse = {
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        reason: body.reason,
        fatigue: fatigue.current_fatigue, // 현재 0인 상태 그대로 반환
        fatigue_change: 0, // 변화 없음
      };
      return HttpResponse.json(resp, { status: 200 });
    }

    // 현재 피로도 값에 변경량을 더해 새로운 피로도를 계산하고, 0 미만으로 내려가지 않도록 합니다.
    const newFatigue = Math.max(
      0,
      fatigue.current_fatigue + body.fatigue_change
    );

    // 전역 'fatigue' 객체의 상태를 업데이트하여 다음 요청에 반영되도록 합니다.
    fatigue.current_fatigue = newFatigue;

    const newHistoryEntry: fatigueHistory = {
      fatigueId: mockFatigueHistories.length + 1,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      reason: body.reason,
      fatigue: newFatigue,
      fatigue_change: body.fatigue_change,
    };

    // 새 히스토리를 mock 데이터에 추가합니다.
    mockFatigueHistories.push(newHistoryEntry);

    const resp: fatigueUpdateResponse = {
      createdAt: newHistoryEntry.created_at,
      reason: body.reason,
      fatigue: newFatigue,
      fatigue_change: body.fatigue_change,
    };
    return HttpResponse.json(resp, { status: 200 });
  }),

  // 피로도 하루 히스토리 조회
  http.get(`${API_BASE_URL}/fatigues/daily`, async () => {
    return HttpResponse.json(mockFatigueHistories);
  }),

  // 피로도 일주일 통계 조회
  http.get(`${API_BASE_URL}/info/fatigues`, async () => {
    return HttpResponse.json(fatigueDashboardData);
  }),

  // 걸음수 일주일 통계 조회
  http.get(`${API_BASE_URL}/info/foot-steps`, async () => {
    return HttpResponse.json(footStepDashboardData);
  }),

  /** 설문조사 */
  // 설문조사 응답 제출 (POST)
  http.post(`${API_BASE_URL}/mypage/survey`, async ({ request }) => {
    const body = (await request.json()) as SurveyAnswerProps[];
    // 받은 배열 그대로 응답
    return HttpResponse.json(body);
  }),

  // 설문조사 응답 조회 (GET)
  http.get(`${API_BASE_URL}/mypage/survey`, () => {
    // 조회는 보통 서버에서 저장된 데이터 반환
    // 임시 mock 데이터 리턴해도 됨
    const mockAnswers: SurveyAnswerProps[] = [
      { surveyQuestionId: 1, answerValue: 3 },
      { surveyQuestionId: 2, answerValue: 4 },
      { surveyQuestionId: 3, answerValue: 1 },
      { surveyQuestionId: 4, answerValue: 5 },
      { surveyQuestionId: 5, answerValue: 2 },
    ];
    return HttpResponse.json(mockAnswers);
  }),

  // 설문조사 응답 수정 (PUT)
  http.put(`${API_BASE_URL}/mypage/survey`, async ({ request }) => {
    const body = (await request.json()) as SurveyAnswerProps[];
    // 수정 후 결과 반환 (여기도 배열 그대로 돌려주면 충분)
    return HttpResponse.json(body);
  }),
];

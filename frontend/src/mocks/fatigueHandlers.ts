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
} from "@/api/fatigueApi";
import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://j13a305.p.ssafy.io/api/v1";
const NICKNAME = "애옹";

let fatigue: MainFatigueProps = {
  nickname: NICKNAME,
  currentFatigue: 30,
};

const mockFatigueHistories: fatigueHistory[] = [
  {
    fatigueId: 1,
    createdAt: "2025-09-20 09:15:00",
    reason: "COFFEE",
    fatigue: 35,
    fatigueChange: -5,
  },
  {
    fatigueId: 2,
    createdAt: "2025-09-20 14:30:00",
    reason: "WALK",
    fatigue: 30,
    fatigueChange: -5,
  },
  {
    fatigueId: 3,
    createdAt: "2025-09-21 22:10:00",
    reason: "NAP",
    fatigue: 40,
    fatigueChange: +10,
  },
  {
    fatigueId: 4,
    createdAt: "2025-09-22 08:45:00",
    reason: "COFFEE",
    fatigue: 28,
    fatigueChange: -7,
  },
  {
    fatigueId: 5,
    createdAt: "2025-09-22 18:00:00",
    reason: "WALK",
    fatigue: 32,
    fatigueChange: -3,
  },
];

const fatigueData: fatigueDataProps[] = [
  { day: "mon", fatigue: 20 },
  { day: "tue", fatigue: 35 },
  { day: "wed", fatigue: 25 },
  { day: "thu", fatigue: 80 },
  { day: "fri", fatigue: 90 },
  { day: "sat", fatigue: 30 },
  { day: "sun", fatigue: 45 },
];

const fatigueDashboardData: fatigueDashboardProps = {
  nickname: NICKNAME,
  fatigueRank: 4,
  data: fatigueData,
};

const footStepData: footStepDataProps[] = [
  { day: "mon", footStep: 2533 },
  { day: "tue", footStep: 2500 },
  { day: "wed", footStep: 1500 },
  { day: "thu", footStep: 3000 },
  { day: "fri", footStep: 1500 },
  { day: "sat", footStep: 400 },
  { day: "sun", footStep: 300 },
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

    // 서버가 계산해줬다고 가정해서, 임의로 결과값 만들어줌
    const baseFatigue = 30; // 기준값 (mock 고정)
    const newFatigue = baseFatigue + body.fatigueChange;

    const resp: fatigueUpdateResponse = {
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      reason: body.reason,
      fatigue: newFatigue,
      fatigueChange: body.fatigueChange,
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
];

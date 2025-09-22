/** @format */

import {
  fatigueHistory,
  fatigueUpdateRequest,
  fatigueUpdateResponse,
  MainFatigueProps,
} from "@/api/fatigueApi";
import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://j13a305.p.ssafy.io/api/v1";

let fatigue: MainFatigueProps = {
  nickname: "MockNickname",
  currentFatigue: 30,
};

export const mockFatigueHistories: fatigueHistory[] = [
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
    const newFatigue = baseFatigue + body.fatigue_change;

    const resp: fatigueUpdateResponse = {
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      reason: body.reason,
      fatigue: newFatigue,
      fatigueChange: body.fatigue_change,
    };
    return HttpResponse.json(resp, { status: 200 });
  }),

  // 피로도 하루 히스토리 조회
  http.get(`${API_BASE_URL}/fatigues/daily`, async () => {
    return HttpResponse.json(mockFatigueHistories);
  }),
];

/** @format myPage MSW handlers */

import { AlarmSettingsProps, InfoProps } from "../api/mypageApi";

import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:8080/api/v1";

export const mypageHandlers = [
  /** 프로필 조회, 변경 */
  // 프로필 조회 (GET)
  http.get(`${API_BASE_URL}/mypage/profile`, () => {
    return HttpResponse.json({
      nickname: "MockUser",
      email: "mock@example.com",
    });
  }),

  // 프로필 수정 (PATCH)
  http.post(`${API_BASE_URL}/mypage/profile`, async ({ request }) => {
    const body = (await request.json()) as InfoProps;
    return HttpResponse.json({
      ...body,
    });
  }),

  /** push 알림 설정 */
  // 조회 (GET)
  http.get(`${API_BASE_URL}/mypage/alarm/settings`, () => {
    // 그냥 서버에서 내려줄 mock 데이터 반환
    const mockSettings: AlarmSettingsProps = {
      generalEnabled: true,
      sleepEnabled: false,
    };
    return HttpResponse.json(mockSettings);
  }),

  // 변경 (PATCH)
  http.patch(`${API_BASE_URL}/mypage/alarm/settings`, async ({ request }) => {
    const body = (await request.json()) as AlarmSettingsProps;
    // 수정된 설정 그대로 반환
    return HttpResponse.json(body);
  }),
];

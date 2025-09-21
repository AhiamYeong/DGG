/** @format myPage MSW handlers */

import {
  AlarmSettingsProps,
  InfoProps,
  SurveyAnswerProps,
} from "../api/mypageApi";
import { http, HttpResponse } from "msw";
const API_BASE_URL = "https://j13a305.p.ssafy.io/api/v1";
export const handlers = [
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

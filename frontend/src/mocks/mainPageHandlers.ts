/** @format */

import { http, HttpResponse } from "msw";

const mockData = {
  nickname: "윤밀원",
  fatigue: {
    level: 20,
  },
  weather: {
    status: "SUNNY",
    description: "오늘은 맑아요",
    temperature: 25.5,
  },
  bookmarkRoutes: [
    {
      bookmarkRouteId: 13,
      name: "덜 피곤한 경로",
    },
  ],
};

const API_BASE_URL = "http://localhost:8080/api/v1";

export const mainPageHandler = [
  http.get(`${API_BASE_URL}/home`, () => {
    return HttpResponse.json(mockData);
  }),
];

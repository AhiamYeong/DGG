/** @format */

import { createApiClient } from "../utils/apiClient";

const API_BASE_URL = "https://j13a305.p.ssafy.io/api/v1/";
export const mainPageApi = createApiClient(API_BASE_URL);

export interface Weather {
  status: string;
  description: string;
  temperature: number;
}

export interface BookmarkRoutes {
  bookmarkRouteId: number;
  name: string;
}

export interface MainProps {
  nickname: string;
  fatigue: number;
  weather: Weather;
  bookmarkRoutes: BookmarkRoutes[];
}

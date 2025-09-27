/**
 * 메인페이지 데이터 관련 API
 * 
 * 기능:
 * - 사용자 정보 (닉네임, 피로도)
 * - 날씨 정보
 * - 즐겨찾기 경로 목록
 * 
 * 사용 페이지:
 * - MainPage: 메인 대시보드 데이터 표시
 * - MainMapPage: 사용자 정보 및 날씨 표시
 * 
 * @format
 */

import { createApiClient } from "../utils/apiClient";

const API_BASE_URL = "http://localhost:8080/api/v1/";
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

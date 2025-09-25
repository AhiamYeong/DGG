/**
 * 경로 즐겨찾기 관련 API
 * 
 * 기능:
 * - 경로 즐겨찾기 조회, 추가, 수정, 삭제
 * - 즐겨찾기 이름 변경
 * - 경로 안내 완료 후 즐겨찾기 추가
 * 
 * 사용 페이지:
 * - MainPage: 즐겨찾기 경로 목록 표시
 * - SearchPage: 경로 검색 결과에서 즐겨찾기 추가/제거
 * - RouteResultsContainer: 경로 카드에서 즐겨찾기 토글
 * - NavigationMode: 경로 안내 완료 후 즐겨찾기 추가
 * 
 * @format
 */

import { createApiClient } from "@/utils/apiClient";
import { throwApiError } from "@/utils/apiError";
import type { BookmarkRoute, AddRouteBookmarkRequest } from "@/types/bookmark";

// 경로 안내 완료 후 즐겨찾기 추가 요청 타입
export interface AddPostNavigationBookmarkRequest {
  name: string;
  departureName: string;
  destinationName: string;
  routeId: number; // 데이터베이스 ID
}

// 다른 API 파일들과 동일한 베이스 URL 사용
const API_BASE_URL = "https://j13a305.p.ssafy.io/api/";
const api = createApiClient(API_BASE_URL);
const BASE = "/v1/bookmarks/routes";

export const favoriteRoutesApi = {
  // 경로 즐겨찾기 목록 조회
  async getRouteBookmarks(): Promise<BookmarkRoute[]> {
    try {
      const res = await api.get<BookmarkRoute[]>(BASE);
      return res.data;
    } catch (e) {
      throwApiError(e);
    }
  },

  // 경로 검색 결과에서 즐겨찾기 추가 (routeKey 사용)
  async createRouteBookmark(
    payload: AddRouteBookmarkRequest
  ): Promise<BookmarkRoute> {
    try {
      const res = await api.post<BookmarkRoute>(BASE, payload);
      return res.data;
    } catch (e) {
      throwApiError(e);
    }
  },

  // 경로 안내 완료 후 즐겨찾기 추가 (routeId 사용)
  async createPostNavigationBookmark(
    payload: AddPostNavigationBookmarkRequest
  ): Promise<BookmarkRoute> {
    try {
      const res = await api.post<BookmarkRoute>(BASE, payload);
      return res.data;
    } catch (e) {
      throwApiError(e);
    }
  },

  // 경로 즐겨찾기 이름 수정
  async updateRouteBookmarkName(
    bookmarkRouteId: number,
    name: string
  ): Promise<BookmarkRoute> {
    try {
      const res = await api.put<BookmarkRoute>(`${BASE}/${bookmarkRouteId}`, {
        name,
      });
      return res.data;
    } catch (e) {
      throwApiError(e);
    }
  },

  // 경로 즐겨찾기 삭제
  async deleteRouteBookmark(bookmarkRouteId: number): Promise<void> {
    try {
      await api.delete(`${BASE}/${bookmarkRouteId}`);
    } catch (e) {
      throwApiError(e);
    }
  },
};

export default favoriteRoutesApi;

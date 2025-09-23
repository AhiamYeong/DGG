import { createApiClient } from '@/utils/apiClient';
import { throwApiError } from '@/utils/apiError';
import type { BookmarkRoute, AddRouteBookmarkRequest } from '@/types/bookmark';

// 다른 API 파일들과 동일한 베이스 URL 사용
const API_BASE_URL = 'https://j13a305.p.ssafy.io/api/';
const api = createApiClient(API_BASE_URL);
const BASE = '/v1/bookmarks/routes';

export const bookmarkApi = {
  async getRouteBookmarks(): Promise<BookmarkRoute[]> {
    try {
      const res = await api.get<BookmarkRoute[]>(BASE);
      return res.data;
    } catch (e) {
      throwApiError(e);
    }
  },

  async createRouteBookmark(payload: AddRouteBookmarkRequest): Promise<BookmarkRoute> {
    try {
      const res = await api.post<BookmarkRoute>(BASE, payload);
      return res.data;
    } catch (e) {
      throwApiError(e);
    }
  },

  async updateRouteBookmarkName(bookmarkRouteId: number, name: string): Promise<BookmarkRoute> {
    try {
      const res = await api.put<BookmarkRoute>(`${BASE}/${bookmarkRouteId}`, { name });
      return res.data;
    } catch (e) {
      throwApiError(e);
    }
  },

  async deleteRouteBookmark(bookmarkRouteId: number): Promise<void> {
    try {
      await api.delete(`${BASE}/${bookmarkRouteId}`);
    } catch (e) {
      throwApiError(e);
    }
  }
};

export default bookmarkApi;

/**
 * 검색 기록 관리 관련 API
 * 
 * 기능:
 * - 최근 검색 내역 조회, 추가, 삭제
 * - API 연결 테스트
 * 
 * 사용 페이지:
 * - SearchPage: 최근 검색 내역 표시
 * - RecentSearchList: 최근 검색 목록 관리
 * - SearchBox: 검색 기록에서 빠른 재검색
 * 
 * @format
 */

import type { 
  ApiResponse,
  RecentSearchApiResponse,
  AddRecentSearchRequest
} from '../types/api-types';
import { createApiClient, apiCall, testApiConnection } from '../utils/apiClient';
import { API_CONSTANTS } from '../constants';

// 타입 별칭으로 통합
export type RecentSearch = RecentSearchApiResponse;
// API 요청 타입 재export
export type { AddRecentSearchRequest };

// API 설정 — 배포 서버로 연결
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/';

// API 클라이언트 생성
const searchHistoryApi = createApiClient(API_BASE_URL, API_CONSTANTS.TIMEOUT);

/**
 * 최근 검색 내역 API
 */
export const recentSearchApi = {
  // 최근 검색 내역 조회
  getRecentSearches: (): Promise<ApiResponse<RecentSearch[]>> =>
    apiCall(
      () => searchHistoryApi.get('/v1/search/recent'),
      '최근 검색 내역을 불러오는데 실패했습니다.'
    ),

  // 최근 검색 내역 추가
  addRecentSearch: (request: AddRecentSearchRequest): Promise<ApiResponse<RecentSearch>> =>
    apiCall(
      () => searchHistoryApi.post('/v1/search/recent', request),
      '최근 검색 내역 추가에 실패했습니다.'
    ),

  // 최근 검색 내역 삭제
  deleteRecentSearch: (id: string): Promise<ApiResponse<void>> =>
    apiCall(
      () => searchHistoryApi.delete(`/v1/search/recent/${id}`),
      '최근 검색 내역 삭제에 실패했습니다.'
    )
};

// 즐겨찾기 장소 API는 favoritePlacesApi.ts로 분리되었습니다.

/**
 * API 연결 테스트 함수
 */
export const testSearchHistoryApiConnection = (): Promise<{
  success: boolean;
  message: string;
  hasCredentials: boolean;
}> => testApiConnection(searchHistoryApi, '/health');

import type { 
  ApiResponse,
  RecentSearchApiResponse,
  FavoritePlaceApiResponse,
  AddRecentSearchRequest,
  AddFavoritePlaceRequest
} from '../types/api-types';
import { createApiClient, apiCall, testApiConnection } from '../utils/apiUtils';
import { API_CONSTANTS } from '../constants';

// 타입 별칭으로 통합
export type RecentSearch = RecentSearchApiResponse;
export type FavoritePlace = FavoritePlaceApiResponse;

// API 요청 타입 재export
export type { AddRecentSearchRequest, AddFavoritePlaceRequest };

// API 설정 — 배포/개발 모두 Vite 환경변수 사용, 기본값은 '/api'
const API_BASE_URL = import.meta.env.VITE_API_BASE || '/api';

// API 클라이언트 생성
const searchHistoryApi = createApiClient(API_BASE_URL, API_CONSTANTS.TIMEOUT);

/**
 * 최근 검색 내역 API
 */
export const recentSearchApi = {
  // 최근 검색 내역 조회
  getRecentSearches: (): Promise<ApiResponse<RecentSearch[]>> =>
    apiCall(
      () => searchHistoryApi.get('/search/recent'),
      '최근 검색 내역을 불러오는데 실패했습니다.'
    ),

  // 최근 검색 내역 추가
  addRecentSearch: (request: AddRecentSearchRequest): Promise<ApiResponse<RecentSearch>> =>
    apiCall(
      () => searchHistoryApi.post('/search/recent', request),
      '최근 검색 내역 추가에 실패했습니다.'
    ),

  // 최근 검색 내역 삭제
  deleteRecentSearch: (id: string): Promise<ApiResponse<void>> =>
    apiCall(
      () => searchHistoryApi.delete(`/search/recent/${id}`),
      '최근 검색 내역 삭제에 실패했습니다.'
    )
};

/**
 * 즐겨찾기 장소 API
 */
export const favoritePlacesApi = {
  // 즐겨찾기 장소 목록 조회
  getFavoritePlaces: (): Promise<ApiResponse<FavoritePlace[]>> =>
    apiCall(
      () => searchHistoryApi.get('/favorites'),
      '즐겨찾기 장소를 불러오는데 실패했습니다.'
    ),

  // 즐겨찾기 장소 추가
  addFavoritePlace: (request: AddFavoritePlaceRequest): Promise<ApiResponse<FavoritePlace>> =>
    apiCall(
      () => searchHistoryApi.post('/favorites', request),
      '즐겨찾기 장소 추가에 실패했습니다.'
    ),

  // 즐겨찾기 장소 삭제
  deleteFavoritePlace: (id: string): Promise<ApiResponse<void>> =>
    apiCall(
      () => searchHistoryApi.delete(`/favorites/${id}`),
      '즐겨찾기 장소 삭제에 실패했습니다.'
    )
};

/**
 * API 연결 테스트 함수
 */
export const testSearchHistoryApiConnection = (): Promise<{
  success: boolean;
  message: string;
  hasCredentials: boolean;
}> => testApiConnection(searchHistoryApi, '/health');

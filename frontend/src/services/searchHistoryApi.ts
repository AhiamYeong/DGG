import type { 
  ApiSearchResult, 
  AddSearchResultRequest
} from '../types/search';
import { createApiClient, apiCall, testApiConnection, type ApiResponse } from '../utils/apiUtils';

// 최근 검색 내역 타입 (API 응답용)
export interface RecentSearch {
  id: string;
  query: string;
  resultCount: number;
  timestamp: string;
  userId?: string;
}

// 검색 내역 추가 요청 타입
export interface AddRecentSearchRequest {
  query: string;
  resultCount: number;
}

// 타입 별칭으로 통합
export type FavoritePlace = ApiSearchResult;
export type AddFavoritePlaceRequest = AddSearchResultRequest;

// API 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-server.com/api'
  : 'http://localhost:8080/api';

// API 클라이언트 생성
const searchHistoryApi = createApiClient(API_BASE_URL, 3000);

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

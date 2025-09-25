/**
 * 장소 즐겨찾기 관련 API
 * 
 * 기능:
 * - 즐겨찾기 장소 조회, 추가, 수정, 삭제
 * - 장소 이름 변경
 * 
 * 사용 페이지:
 * - SearchPage: 즐겨찾기 장소 목록 표시
 * - FavoritePlacesList: 즐겨찾기 장소 관리
 * - SearchBox: 즐겨찾기 장소에서 빠른 검색
 * 
 * @format
 */

import type { ApiResponse, FavoritePlaceApiResponse } from '@/types/api-types';
import { createApiClient, apiCall } from '@/utils/apiClient';
import { API_CONSTANTS } from '@/constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'https://j13a305.p.ssafy.io/api/';
const favoriteApi = createApiClient(API_BASE_URL, API_CONSTANTS.TIMEOUT);

export type FavoritePlace = FavoritePlaceApiResponse;

export const favoritePlacesApi = {
  // GET /api/v1/bookmarks/places
  getFavoritePlaces: (): Promise<ApiResponse<FavoritePlace[]>> =>
    apiCall(
      () => favoriteApi.get('/v1/bookmarks/places'),
      '즐겨찾기 장소를 불러오는데 실패했습니다.'
    ),

  // POST /api/v1/bookmarks/places (위도/경도 제거)
  addFavoritePlace: (request: { placeName: string; address: string }): Promise<ApiResponse<FavoritePlace>> =>
    apiCall(
      () => favoriteApi.post('/v1/bookmarks/places', request),
      '즐겨찾기 장소 추가에 실패했습니다.'
    ),

  // PUT /api/v1/bookmarks/places/{bookmarkPlaceId}
  updateFavoritePlaceName: (bookmarkPlaceId: number, placeName: string): Promise<ApiResponse<FavoritePlace>> =>
    apiCall(
      () => favoriteApi.put(`/v1/bookmarks/places/${bookmarkPlaceId}`, { placeName }),
      '즐겨찾기 장소 이름 변경에 실패했습니다.'
    ),

  // DELETE /api/v1/bookmarks/places/{bookmarkPlaceId}
  deleteFavoritePlace: (bookmarkPlaceId: number | string): Promise<ApiResponse<void>> =>
    apiCall(
      () => favoriteApi.delete(`/v1/bookmarks/places/${bookmarkPlaceId}`),
      '즐겨찾기 장소 삭제에 실패했습니다.'
    )
};

export default favoritePlacesApi;

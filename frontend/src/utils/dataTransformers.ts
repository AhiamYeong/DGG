import type { FavoritePlaceApiResponse, RecentSearchApiResponse } from '../types/api-types';

// API 응답을 컴포넌트 타입으로 변환하는 유틸리티 함수들

/**
 * API 검색 결과를 컴포넌트용 타입으로 변환
 */
export function transformApiSearchResult(apiResult: FavoritePlaceApiResponse) {
  return {
    id: apiResult.id,
    name: apiResult.title,
    address: apiResult.address,
    category: apiResult.category,
    isFavorite: true
  };
}

/**
 * 최근 검색 내역을 컴포넌트용 타입으로 변환
 */
export function transformRecentSearch(recentSearch: RecentSearchApiResponse) {
  return {
    id: recentSearch.id,
    name: recentSearch.query,
    address: `검색 결과 ${recentSearch.resultCount}개`,
    timestamp: new Date(recentSearch.timestamp)
  };
}

/**
 * 즐겨찾기 장소 배열을 컴포넌트용 타입으로 변환
 */
export function transformFavoritePlaces(places: FavoritePlaceApiResponse[]) {
  return places.map(transformApiSearchResult);
}

/**
 * 최근 검색 내역 배열을 컴포넌트용 타입으로 변환
 */
export function transformRecentSearches(searches: RecentSearchApiResponse[]) {
  return searches.map(transformRecentSearch);
}

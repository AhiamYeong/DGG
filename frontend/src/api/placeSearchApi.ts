import { createApiClient } from '../utils/apiClient';

// API 설정
const API_BASE_URL = 'http://localhost:8080/api/'; // 로컬 개발용
// const API_BASE_URL = 'https://j13a305.p.ssafy.io/api/'; // 배포용 (임시 주석처리)

// 공통 API 클라이언트 생성
const placeSearchApi = createApiClient(API_BASE_URL);

// 백엔드 검색 API 응답 타입 정의
export interface SearchItem {
  title: string;           // 장소명 (HTML 태그 포함 가능)
  address: string;         // 지번 주소
  roadAddress: string;     // 도로명 주소
}

export interface SearchResponse {
  items: SearchItem[];     // 검색 결과 배열
}

// 검색 옵션 타입
export interface SearchOptions {
  display?: number;       // 표시할 결과 개수
  start?: number;         // 검색 시작 위치
  sort?: 'random' | 'comment'; // 정렬 방법
}

/**
 * 장소 검색 API 호출
 * @param query 검색어
 * @param options 검색 옵션
 * @returns 검색 결과
 */
export const searchPlaces = async (
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> => {
  const params = {
    query: query.trim(),
    ...(options.display && { display: options.display }),
    ...(options.start && { start: options.start }),
    ...(options.sort && { sort: options.sort })
  };

  const response = await placeSearchApi.get('/v1/search/places', { params });
  return response.data;
};

/**
 * <b> 태그 제거 유틸리티
 * @param text <b> 태그가 포함된 텍스트
 * @returns <b> 태그가 제거된 텍스트
 */
export const removeBTags = (text: string): string => {
  return text.replace(/<\/?b>/g, '');
};

export default placeSearchApi;

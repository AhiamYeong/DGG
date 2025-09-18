// API 관련 타입 정의

/**
 * 공통 API 응답 타입
 * @template T 응답 데이터의 타입
 */
export interface ApiResponse<T> {
  /** API 호출 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data: T;
  /** 응답 메시지 */
  message: string;
  /** 에러 메시지 (실패 시) */
  error?: string;
}

// 네이버 검색 API 응답 타입
export interface NaverSearchApiResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverSearchItem[];
}

export interface NaverSearchItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

// 장소 검색 API 응답 타입
export interface PlaceSearchApiResponse {
  query: string;
  size: number;
  data: Array<{
    name: string;
    isBookmark: boolean;
    displayAddress: string;
    mapx: number;
    mapy: number;
    address: {
      road: string;
      jibun: string;
    };
  }>;
}

// 검색 내역 API 타입
export interface RecentSearchApiResponse {
  id: string;
  query: string;
  resultCount: number;
  timestamp: string;
  userId?: string;
}

export interface FavoritePlaceApiResponse {
  id: string;
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
  coordinates: {
    x: number;
    y: number;
  };
  createdAt: string;
  userId?: string;
}

// API 요청 타입
export interface AddRecentSearchRequest {
  query: string;
  resultCount: number;
}

export interface AddFavoritePlaceRequest {
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
  coordinates: {
    x: number;
    y: number;
  };
}

import axios from 'axios';

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

// 최근 검색 내역 타입
export interface RecentSearch {
  id: string;
  query: string;
  resultCount: number;
  timestamp: string;
  userId?: string;
}

// 즐겨찾기 장소 타입
export interface FavoritePlace {
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

// 검색 내역 추가 요청 타입
export interface AddRecentSearchRequest {
  query: string;
  resultCount: number;
}

// 즐겨찾기 추가 요청 타입
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

// API 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-server.com/api'
  : 'http://localhost:8080/api';

// Axios 인스턴스 생성
const searchHistoryApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000, // 3초로 단축 (사용자 경험 개선)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 추가 (인증이 필요한 경우)
searchHistoryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
searchHistoryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('검색 내역 API 에러:', error);
    return Promise.reject(error);
  }
);

/**
 * 최근 검색 내역 API
 */
export const recentSearchApi = {
  // 최근 검색 내역 조회
  getRecentSearches: async (): Promise<ApiResponse<RecentSearch[]>> => {
    try {
      const response = await searchHistoryApi.get('/search/recent');
      return response.data;
    } catch (error) {
      console.error('최근 검색 내역 조회 실패:', error);
      return {
        success: false,
        data: [],
        message: '최근 검색 내역을 불러오는데 실패했습니다.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  },

  // 최근 검색 내역 추가
  addRecentSearch: async (request: AddRecentSearchRequest): Promise<ApiResponse<RecentSearch>> => {
    try {
      const response = await searchHistoryApi.post('/search/recent', request);
      return response.data;
    } catch (error) {
      console.error('최근 검색 내역 추가 실패:', error);
      return {
        success: false,
        data: {} as RecentSearch,
        message: '최근 검색 내역 추가에 실패했습니다.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  },

  // 최근 검색 내역 삭제
  deleteRecentSearch: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await searchHistoryApi.delete(`/search/recent/${id}`);
      return response.data;
    } catch (error) {
      console.error('최근 검색 내역 삭제 실패:', error);
      return {
        success: false,
        data: undefined,
        message: '최근 검색 내역 삭제에 실패했습니다.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }
};

/**
 * 즐겨찾기 장소 API
 */
export const favoritePlacesApi = {
  // 즐겨찾기 장소 목록 조회
  getFavoritePlaces: async (): Promise<ApiResponse<FavoritePlace[]>> => {
    try {
      const response = await searchHistoryApi.get('/favorites');
      return response.data;
    } catch (error) {
      console.error('즐겨찾기 장소 조회 실패:', error);
      return {
        success: false,
        data: [],
        message: '즐겨찾기 장소를 불러오는데 실패했습니다.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  },

  // 즐겨찾기 장소 추가
  addFavoritePlace: async (request: AddFavoritePlaceRequest): Promise<ApiResponse<FavoritePlace>> => {
    try {
      const response = await searchHistoryApi.post('/favorites', request);
      return response.data;
    } catch (error) {
      console.error('즐겨찾기 장소 추가 실패:', error);
      return {
        success: false,
        data: {} as FavoritePlace,
        message: '즐겨찾기 장소 추가에 실패했습니다.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  },

  // 즐겨찾기 장소 삭제
  deleteFavoritePlace: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await searchHistoryApi.delete(`/favorites/${id}`);
      return response.data;
    } catch (error) {
      console.error('즐겨찾기 장소 삭제 실패:', error);
      return {
        success: false,
        data: undefined,
        message: '즐겨찾기 장소 삭제에 실패했습니다.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }
};

/**
 * API 연결 테스트 함수
 */
export const testSearchHistoryApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  hasCredentials: boolean;
}> => {
  try {
    // 간단한 헬스 체크 API 호출 (타임아웃 1초)
    const response = await searchHistoryApi.get('/health', { timeout: 1000 });
    return {
      success: true,
      message: '검색 내역 API 연결 성공',
      hasCredentials: true
    };
  } catch (error) {
    console.warn('검색 내역 API 연결 실패 (백엔드 서버가 없을 수 있음):', error);
    return {
      success: false,
      message: '검색 내역 API 연결 실패 - 백엔드 서버가 실행되지 않았을 수 있습니다',
      hasCredentials: false
    };
  }
};

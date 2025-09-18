import axios from 'axios';
import { API_CONSTANTS } from '../constants';
import type { PlaceSearchApiResponse } from '../types/api-types';

// API 설정
const API_BASE_URL = '/api/v1/search';

// Axios 인스턴스 생성
const placeSearchApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONSTANTS.TIMEOUT, // 상수 사용
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
placeSearchApi.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 장소 검색 API 요청:', config);
    }
    return config;
  },
  (error) => {
    console.error('❌ 장소 검색 API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
placeSearchApi.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 장소 검색 API 응답:', response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ 장소 검색 API 응답 에러:', error);
    
    // 에러 메시지 개선
    if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다. 검색어를 확인해주세요.');
    } else if (error.response?.status === 404) {
      throw new Error('검색 결과를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      throw new Error('검색 중 오류가 발생했습니다.');
    }
  }
);

/**
 * 장소 검색 API 호출
 * @param query 검색어
 * @returns 검색 결과
 */
export const searchPlaces = async (query: string): Promise<PlaceSearchApiResponse> => {
  try {
    // 검색어가 비어있으면 빈 결과 반환
    if (!query.trim()) {
      return {
        query: '',
        size: 0,
        data: []
      };
    }

    // API 호출
    const response = await placeSearchApi.get('/places', {
      params: {
        query: query.trim()
      }
    });
    
    return response.data;
    
  } catch (error) {
    console.error('장소 검색 API 호출 실패:', error);
    throw error;
  }
};

/**
 * 검색 결과를 앱에서 사용하는 형식으로 변환
 * @param apiResponse API 응답 데이터
 * @returns 앱에서 사용하는 검색 결과 형식
 */
export const convertPlaceSearchResults = (apiResponse: PlaceSearchApiResponse) => {
  return apiResponse.data.map((item, index) => ({
    id: `place_${index}_${Date.now()}`, // 고유 ID 생성
    name: item.name,
    address: item.displayAddress,
    category: 'place', // 기본 카테고리
    description: item.displayAddress,
    distance: undefined, // 거리 정보 없음
    rating: undefined,   // 평점 정보 없음
    isFavorite: item.isBookmark,
    coordinates: {
      lat: item.mapy / 100000, // 좌표 변환 (네이버 좌표계 → WGS84)
      lng: item.mapx / 100000
    },
    phone: undefined,
    link: undefined,
    roadAddress: item.address.road,
    jibunAddress: item.address.jibun
  }));
};

/**
 * 장소 검색 (앱 형식으로 변환)
 * @param query 검색어
 * @returns 앱에서 사용하는 검색 결과 형식
 */
export const searchPlacesWithApi = async (query: string) => {
  try {
    const response = await searchPlaces(query);
    const convertedResults = convertPlaceSearchResults(response);
    
    return {
      success: true,
      data: convertedResults,
      total: response.size,
      message: `${response.size}개의 검색 결과를 찾았습니다.`
    };
  } catch (error) {
    console.error('장소 검색 실패:', error);
    return {
      success: false,
      data: [],
      total: 0,
      message: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.'
    };
  }
};

/**
 * API 연결 테스트 함수
 * @returns API 연결 상태
 */
export const testPlaceSearchApiConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // 간단한 테스트 검색
    const response = await placeSearchApi.get('/places', {
      params: {
        query: '성수역'
      }
    });

    if (response.data && response.data.data) {
      return {
        success: true,
        message: `API 연결 성공! 총 ${response.data.size}개의 결과를 찾았습니다.`
      };
    } else {
      return {
        success: false,
        message: 'API 응답 형식이 올바르지 않습니다.'
      };
    }
  } catch (error: any) {
    console.error('장소 검색 API 테스트 실패:', error);
    
    if (error.response?.status === 400) {
      return {
        success: false,
        message: '잘못된 요청입니다. API 파라미터를 확인해주세요.'
      };
    } else if (error.response?.status === 404) {
      return {
        success: false,
        message: 'API 엔드포인트를 찾을 수 없습니다.'
      };
    } else {
      return {
        success: false,
        message: `API 연결 실패: ${error.message}`
      };
    }
  }
};

export default placeSearchApi;

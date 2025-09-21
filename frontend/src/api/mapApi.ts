// 네이버 지도 API 및 서버 API 호출
import { createApiClient } from '../utils/apiClient';
import { log } from '../utils/logger';

// API 설정
const API_BASE_URL = 'http://localhost:8080/api/'; // 로컬 개발용
// const API_BASE_URL = 'https://j13a305.p.ssafy.io/api/'; // 배포용 (임시 주석처리)

// 공통 API 클라이언트 생성
const mapApi = createApiClient(API_BASE_URL);

// 네이버 지도 API 키
export const getNaverMapClientId = (): string => {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
  if (!clientId) {
    throw new Error('VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.');
  }
  return clientId;
};

// 네이버 지도 API 스크립트 로드
export const loadNaverMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.naver && window.naver.maps) {
      resolve();
      return;
    }

    // 스크립트 태그 생성
    const script = document.createElement('script');
    const clientId = getNaverMapClientId();
    log.debug('네이버 지도 API 키 로드', { clientId: clientId.substring(0, 10) + '...' });
    
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    
    script.onload = () => {
      log.info('네이버 Map API 로드 완료');
      resolve();
    };
    
    script.onerror = () => {
      log.error('네이버 Map API 로드 실패');
      reject(new Error('네이버 Map API 로드에 실패했습니다.'));
    };
    
    document.head.appendChild(script);
  });
};

interface SearchPlaceResponse {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface RouteResponse {
  id: string;
  name: string;
  from: string;
  to: string;
  time: string;
  isBookmarked: boolean;
}

// 장소 검색 API
export const searchPlaces = async (query: string): Promise<SearchPlaceResponse[]> => {
  try {
    const response = await mapApi.get(`/v1/search/places?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    log.error('장소 검색 오류', error);
    throw error;
  }
};

// // 경로 검색 API (기존 - 더 이상 사용하지 않음)
// export const searchRoutes = async (
//   origin: string,
//   destination: string,
//   waypoints?: string[]
// ): Promise<RouteResponse[]> => {
//   try {
//     const params = new URLSearchParams({
//       origin,
//       destination,
//       ...(waypoints && waypoints.length > 0 && { waypoints: waypoints.join(',') })
//     });
    
//     const response = await mapApi.get(`/routes/search?${params}`);
//     return response.data;
//   } catch (error) {
//     console.error('경로 검색 오류:', error);
//     throw error;
//   }
// };

// 새로운 경로 검색 API (시간 정보 포함)
export const searchRoutesWithTime = async (
  departureAddress: string,
  destinationAddress: string,
  startTime: string,
  stopoverAddresses?: string[]
): Promise<any> => {
  try {
    // stopoverAddresses는 최소 빈배열, 최대 2개
    const validStopoverAddresses = stopoverAddresses && stopoverAddresses.length > 0 
      ? stopoverAddresses.slice(0, 2) // 최대 2개로 제한
      : []; // 빈배열로 설정

    const requestBody = {
      departureAddress,
      destinationAddress,
      stopoverAddresses: validStopoverAddresses,
      startTime
    };

    log.route('경로 검색 API 요청', requestBody);
    console.log('API 요청 형식:', JSON.stringify(requestBody, null, 2));

    // 백엔드 서버 상태 확인을 위한 헬스체크 먼저 시도
    try {
      console.log('백엔드 서버 헬스체크 시도...');
      await mapApi.get('/health');
      console.log('백엔드 서버 정상');
    } catch (healthError) {
      console.warn('백엔드 서버 헬스체크 실패:', healthError);
    }

    const response = await mapApi.post('/v1/maps/routes', requestBody);
    
    log.route('경로 검색 API 응답', response.data);
    return response.data;
  } catch (error: any) {
    log.error('경로 검색 오류', error);
    
    // 더 자세한 에러 정보 로깅
    console.error('=== API 에러 상세 정보 ===');
    console.error('요청 URL:', '/v1/maps/routes');
    console.error('요청 데이터:', JSON.stringify({
      departureAddress,
      destinationAddress,
      stopoverAddresses: stopoverAddresses?.slice(0, 2) || [],
      startTime
    }, null, 2));
    console.error('에러 상태:', error.response?.status);
    console.error('에러 메시지:', error.response?.data);
    console.error('에러 전체:', error);
    console.error('========================');
    
    throw error;
  }
};

// 즐겨찾기 경로 목록 API
export const getFavoriteRoutes = async (): Promise<RouteResponse[]> => {
  try {
    const response = await mapApi.get('/v1/routes/favorites');
    return response.data;
  } catch (error) {
    console.error('즐겨찾기 경로 조회 오류:', error);
    throw error;
  }
};

// 즐겨찾기 경로 추가 API
export const addFavoriteRoute = async (route: Omit<RouteResponse, 'id'>): Promise<RouteResponse> => {
  try {
    const response = await mapApi.post('/v1/routes/favorites', route);
    return response.data;
  } catch (error) {
    console.error('즐겨찾기 경로 추가 오류:', error);
    throw error;
  }
};

// 즐겨찾기 경로 삭제 API
export const removeFavoriteRoute = async (id: string): Promise<void> => {
  try {
    await mapApi.delete(`/v1/routes/favorites/${id}`);
  } catch (error) {
    console.error('즐겨찾기 경로 삭제 오류:', error);
    throw error;
  }
};

// 안내시작 API
export const startRouteGuidance = async (routeKey: string): Promise<any> => {
  try {
    console.log('=== 안내시작 API 시작 ===');
    console.log('routeKey:', routeKey);
    console.log('요청 URL:', `/v1/maps/routes/${routeKey}/start`);
    console.log('요청 헤더:', { 'X-DGG-MEMBER-ID': '1' });
    
    log.route('안내시작 API 요청', { routeKey });
    
    const response = await mapApi.post(`/v1/maps/routes/${routeKey}/start`, {}, {
      headers: {
        'X-DGG-MEMBER-ID': '1' // 테스트용 회원 ID
      }
    });
    
    console.log('=== 안내시작 API 응답 ===');
    console.log('응답 상태:', response.status);
    console.log('응답 헤더:', response.headers);
    console.log('응답 데이터:', response.data);
    console.log('응답 데이터 타입:', typeof response.data);
    
    log.route('안내시작 API 응답', response.data);
    return response.data;
  } catch (error: any) {
    console.log('=== 안내시작 API 에러 ===');
    console.log('에러 객체:', error);
    console.log('에러 메시지:', error.message);
    console.log('에러 응답:', error.response);
    console.log('에러 상태:', error.response?.status);
    console.log('에러 데이터:', error.response?.data);
    console.log('에러 헤더:', error.response?.headers);
    
    log.error('안내시작 API 오류', error);
    throw error;
  }
};

// 상세 경로 조회 API
export const getRouteDetail = async (routeId: string): Promise<any> => {
  try {
    console.log('=== 상세 경로 조회 API 시작 ===');
    console.log('routeId:', routeId);
    console.log('요청 URL:', `/v1/maps/routes/${routeId}`);
    console.log('요청 헤더:', { 'X-DGG-MEMBER-ID': '1' });
    
    log.route('상세 경로 조회 API 요청', { routeId });
    
    const response = await mapApi.get(`/v1/maps/routes/${routeId}`, {
      headers: {
        'X-DGG-MEMBER-ID': '1' // 테스트용 회원 ID
      }
    });
    
    console.log('=== 상세 경로 조회 API 응답 ===');
    console.log('응답 상태:', response.status);
    console.log('응답 헤더:', response.headers);
    console.log('응답 데이터:', response.data);
    console.log('응답 데이터 타입:', typeof response.data);
    
    log.route('상세 경로 조회 API 응답', response.data);
    return response.data;
  } catch (error: any) {
    console.log('=== 상세 경로 조회 API 에러 ===');
    console.log('에러 객체:', error);
    console.log('에러 메시지:', error.message);
    console.log('에러 응답:', error.response);
    console.log('에러 상태:', error.response?.status);
    console.log('에러 데이터:', error.response?.data);
    console.log('에러 헤더:', error.response?.headers);
    
    log.error('상세 경로 조회 API 오류', error);
    throw error;
  }
};
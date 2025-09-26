/**
 * 네이버 지도 API 및 경로 검색 관련 API
 * 
 * 기능:
 * - 네이버 지도 API 스크립트 로드
 * - 장소 검색
 * - 경로 검색 (시간 정보 포함)
 * - 즐겨찾기 경로 관리
 * - 안내시작 및 상세 경로 조회
 * 
 * 사용 페이지:
 * - MainMapPage: 지도 표시 및 경로 검색
 * - SearchPage: 장소 검색 및 경로 검색
 * - NavigationMode: 안내시작 및 상세 경로 조회
 * - MapContainer: 네이버 지도 API 로드
 * 
 * @format
 */

import { createApiClient } from '../utils/apiClient';
import { log } from '../utils/logger';

// API 설정
const API_BASE_URL = 'https://j13a305.p.ssafy.io/api/';

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


// 장소 검색 API
export const searchPlaces = async (query: string): Promise<any[]> => {
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

    const response = await mapApi.post('/v1/maps/routes', requestBody);
    
    log.route('경로 검색 API 응답', response.data);
    return response.data;
  } catch (error: any) {
    log.error('경로 검색 오류', error);
    throw error;
  }
};

// 즐겨찾기 경로 목록 API
export const getFavoriteRoutes = async (): Promise<any[]> => {
  try {
    const response = await mapApi.get('/v1/routes/favorites');
    return response.data;
  } catch (error) {
    console.error('즐겨찾기 경로 조회 오류:', error);
    throw error;
  }
};

// 즐겨찾기 경로 추가 API
export const addFavoriteRoute = async (route: any): Promise<any> => {
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
    log.route('안내시작 API 요청', { routeKey });
    const response = await mapApi.post(`/v1/maps/routes/${routeKey}/start`);
    log.route('안내시작 API 응답', response.data);
    return response.data;
  } catch (error) {
    log.error('안내시작 API 오류', error);
    throw error;
  }
};

// 상세 경로 조회 API
export const getRouteDetail = async (routeId: string): Promise<any> => {
  try {
    log.route('상세 경로 조회 API 요청', { routeId });
    const response = await mapApi.get(`/v1/maps/routes/${routeId}`);
    log.route('상세 경로 조회 API 응답', response.data);
    return response.data;
  } catch (error) {
    log.error('상세 경로 조회 API 오류', error);
    throw error;
  }
};
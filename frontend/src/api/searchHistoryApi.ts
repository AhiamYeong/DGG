/**
 * 검색 기록 관리 관련 API
 * 
 * 기능:
 * - API 연결 테스트
 * 
 * @format
 */

import { createApiClient, testApiConnection } from '../utils/apiClient';
import { API_CONSTANTS } from '../constants';

// API 설정 — 배포 서버로 연결
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/';

// API 클라이언트 생성
const searchHistoryApi = createApiClient(API_BASE_URL, API_CONSTANTS.TIMEOUT);

/**
 * API 연결 테스트 함수
 */
export const testSearchHistoryApiConnection = () => testApiConnection(searchHistoryApi);
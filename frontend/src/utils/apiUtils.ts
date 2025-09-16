import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 공통 API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

// API 클라이언트 생성 유틸리티
export function createApiClient(baseURL: string, timeout: number = 3000): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 공통 요청 인터셉터
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 공통 응답 인터셉터
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.warn('API 요청 실패:', error);
      return Promise.reject(error);
    }
  );

  return client;
}

// 공통 API 호출 래퍼
export async function apiCall<T>(
  apiCall: () => Promise<AxiosResponse<ApiResponse<T>>>,
  errorMessage: string
): Promise<ApiResponse<T>> {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.warn(`${errorMessage}:`, error);
    return {
      success: false,
      data: {} as T,
      message: errorMessage,
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

// API 연결 테스트 유틸리티
export async function testApiConnection(
  client: AxiosInstance,
  endpoint: string = '/health'
): Promise<{ success: boolean; message: string; hasCredentials: boolean }> {
  try {
    await client.get(endpoint, { timeout: 1000 });
    return {
      success: true,
      message: 'API 연결 성공',
      hasCredentials: true
    };
  } catch (error) {
    console.warn('API 연결 실패:', error);
    return {
      success: false,
      message: 'API 연결 실패 - 서버가 실행되지 않았을 수 있습니다',
      hasCredentials: false
    };
  }
}

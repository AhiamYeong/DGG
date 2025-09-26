/** @format */

import axios, { AxiosInstance, AxiosResponse } from "axios";
import { API_CONSTANTS } from "../constants";
import { log } from "./logger";

/**
 * 공통 API 클라이언트 생성 유틸리티
 * 모든 API 파일에서 공통으로 사용되는 설정과 인터셉터를 제공
 */
export function createApiClient(
  baseURL: string,
  timeout: number = API_CONSTANTS.TIMEOUT
): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 요청 인터셉터
  client.interceptors.request.use(
    (config) => {
      log.api.request(
        config.url || "",
        config.method?.toUpperCase() || "GET",
        config.data
      );
      return config;
    },
    (error) => {
      log.api.error("요청 에러", error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  client.interceptors.response.use(
    (response) => {
      log.api.response(
        response.config.url || "",
        response.status,
        response.data
      );
      return response;
    },
    (error) => {
      log.api.error(error.config?.url || "알 수 없는 URL", error);
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * 공통 API 호출 래퍼
 * 에러 처리와 응답 형식을 표준화
 */
export async function apiCall<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  errorMessage: string
): Promise<{ success: boolean; data: T; message?: string }> {
  try {
    const response = await apiCall();
    
    // MSW 응답이 이미 {success, data} 형태인 경우 그대로 반환
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as unknown as { success: boolean; data: T; message?: string };
    }
    
    // 일반 응답인 경우 래핑
    return {
      success: true,
      data: response.data,
      message: "성공",
    };
  } catch (error: any) {
    console.error(errorMessage, error);

    // 에러 메시지 개선
    let message = errorMessage;
    if (error.response?.status === 400) {
      message = "잘못된 요청입니다. 파라미터를 확인해주세요.";
    } else if (error.response?.status === 404) {
      message = "요청한 리소스를 찾을 수 없습니다.";
    } else if (error.response?.status === 500) {
      message = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    } else if (error.code === "NETWORK_ERROR") {
      message = "네트워크 연결을 확인해주세요.";
    }

    return {
      success: false,
      data: {} as T,
      message,
    };
  }
}

/**
 * API 연결 테스트 함수
 */
export async function testApiConnection(
  client: AxiosInstance,
  healthEndpoint: string = "/health"
): Promise<{
  success: boolean;
  message: string;
  hasCredentials: boolean;
}> {
  try {
    const response = await client.get(healthEndpoint);

    if (response.status === 200) {
      return {
        success: true,
        message: "API 연결 성공",
        hasCredentials: true,
      };
    } else {
      return {
        success: false,
        message: `API 응답 오류: ${response.status}`,
        hasCredentials: true,
      };
    }
  } catch (error: any) {
    console.error("API 연결 테스트 실패:", error);

    if (error.response?.status === 400) {
      return {
        success: false,
        message: "잘못된 요청입니다. API 파라미터를 확인해주세요.",
        hasCredentials: true,
      };
    } else if (error.response?.status === 404) {
      return {
        success: false,
        message: "API 엔드포인트를 찾을 수 없습니다.",
        hasCredentials: true,
      };
    } else {
      return {
        success: false,
        message: `API 연결 실패: ${error.message}`,
        hasCredentials: false,
      };
    }
  }
}

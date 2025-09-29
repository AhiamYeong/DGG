/**
 * 사용자 정보 관리 관련 API
 * 
 * 기능:
 * - 기본 정보 (닉네임, 이메일)
 * - 알람 설정
 * 
 * 사용 페이지:
 * - MypagePage: 사용자 정보 표시 및 수정
 * - SettingsPage: 알람 설정 관리
 * 
 * @format
 */

import { createApiClient } from "../utils/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080/api/v1/";
export const mypageApi = createApiClient(API_BASE_URL);

// 기본 정보 interface
export interface InfoProps {
  nickname: string;
  email: string;
}

// 알람 설정 interface
export interface AlarmSettingsProps {
  generalEnabled: boolean;
  sleepEnabled: boolean;
}

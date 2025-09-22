/** @format */

// src/api/alarmApi.ts
import { createApiClient } from "../utils/apiClient";

const API_BASE_URL = "https://j13a305.p.ssafy.io/api/v1/";
export const alarmApi = createApiClient(API_BASE_URL);

// 리스트 조회
export interface AlarmProps {
  alarmId: number;
  title: string;
  eventId: number;
  eventTitle: string;
  departureTime: string;
  departure: string;
  destination: string;
  offsetMinutes: number;
  enabled: boolean;
}

// 특정 오프셋 값만 허용
export type AllowedOffsets = 10 | 30 | 60;

// 알림 생성
export interface AlarmCreateProps {
  eventTitle: string; // 알림명
  departureTime: string;
  departure: string;
  destination: string;
  offsetMinutesList: AllowedOffsets[]; // 하나만 생성할 때는 [10] 처럼 보냄
  enabled: boolean; // 알림 활성화 여부
}

// 알림 수정
export interface AlarmUpdateProps {
  eventTitle: string;
  offsetMinutesList: AllowedOffsets[];
}

// 다음 알람
export interface NextAlarmProps {
  eventTitle: string; // 알림명
  departureTime: string;
  departure: string;
  destination: string;
  offsetMinutes: number;
}

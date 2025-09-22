import { Location, TimeSlot, BaseEntity } from './common-types';

// 경로 관련 타입 정의

// 통합된 주소 정보 (지명 + 도로명 주소)
export interface PlaceInfo {
  name: string;        // 지명 (표시용)
  address: string;     // 도로명 주소 (API용)
}

export type TransportType = 'walk' | 'bus' | 'subway' | 'transfer' | 'taxi' | 'bike';

export interface RouteStep extends BaseEntity {
  type: TransportType;
  description: string;
  duration: number; // 분 단위
  distance?: number; // 미터 단위
  from?: Location;
  to?: Location;
  lineInfo?: {
    name: string;
    color: string;
    direction: string;
    stationCount?: number;
  };
  departureTime?: TimeSlot;
  arrivalTime?: TimeSlot;
  fare?: number;
  congestionLevel?: 'low' | 'medium' | 'high';
}

export interface Route extends BaseEntity {
  name: string;
  totalDuration: number; // 분 단위
  totalDistance: number; // 미터 단위
  steps: RouteStep[];
  departureTime: TimeSlot;
  arrivalTime: TimeSlot;
  price?: number;
  isFavorite?: boolean;
  isBookmarked?: boolean;
  from: Location;
  to: Location;
  carbonFootprint?: number; // CO2 배출량 (g)
  accessibility?: {
    wheelchair: boolean;
    elevator: boolean;
    escalator: boolean;
  };
}

export interface RouteSearchParams {
  from: Location;
  to: Location;
  departureTime?: TimeSlot;
  arrivalTime?: TimeSlot;
  preferences?: {
    avoidTransfers?: boolean;
    preferSubway?: boolean;
    preferBus?: boolean;
    preferWalk?: boolean;
    maxWalkTime?: number; // 분 단위
    maxTransferCount?: number;
    avoidStairs?: boolean;
    wheelchairAccessible?: boolean;
  };
}

export interface RouteGuidance {
  currentStep: number;
  isActive: boolean;
  nextInstruction?: string;
  remainingTime?: number;
  remainingDistance?: number;
  currentLocation?: Location;
  nextStop?: {
    name: string;
    arrivalTime: TimeSlot;
    distance: number;
  };
}

export interface FavoriteRoute extends BaseEntity {
  route: Route;
  name: string;
  description?: string;
  tags?: string[];
}

// 예약 노선 타입 정의
export interface ReservedRoute extends BaseEntity {
  route: Route;
  name: string;
  description?: string;
  reservationTime: TimeSlot;
  isActive: boolean;
  reminderMinutes?: number; // 알림 시간 (분 단위)
  tags?: string[];
}

// 탭 타입 정의
export type RouteTabType = 'favorite' | 'reserved';

// 통합 노선 타입 (즐겨찾기 + 예약)
export type RouteItem = FavoriteRoute | ReservedRoute;

// 노선 타입 구분 함수
export const isFavoriteRoute = (route: RouteItem): route is FavoriteRoute => {
  return 'tags' in route && !('reservationTime' in route);
};

export const isReservedRoute = (route: RouteItem): route is ReservedRoute => {
  return 'reservationTime' in route && 'isActive' in route;
};

export interface RouteHistory extends BaseEntity {
  route: Route;
  usedAt: Date;
  rating?: number;
  feedback?: string;
}

// 간단한 경로 타입 (바텀시트에서 사용)
export interface SimpleRoute extends BaseEntity {
  name: string;
  totalDuration: number; // 분 단위
  totalDistance: number; // 미터 단위
  departureTime: TimeSlot;
  arrivalTime: TimeSlot;
  price?: number;
  from: Location;
  to: Location;
  steps: RouteStep[];
  // 추천 기준
  recommendationType: 'minFatigue' | 'minTime' | 'minTransfer';
  description: string;
  isBookmarked?: boolean;
  fatigueLevel?: number; // 피로도 수치 (0-100)
  // test.json 원본 데이터 (선택사항)
  rawData?: any;
  // routeKey (안내시작 시 사용)
  routeKey?: string;
}
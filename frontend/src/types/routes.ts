import { Location, TimeSlot, BaseEntity } from './common';

// 경로 관련 타입 정의

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

export interface RouteHistory extends BaseEntity {
  route: Route;
  usedAt: Date;
  rating?: number;
  feedback?: string;
}
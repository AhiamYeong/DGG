// test.json 기반 API 응답 타입 정의

// 새로운 백엔드 API 응답 타입 정의
export interface NewBackendRouteApiResponse {
  departureAddress: string;
  destinationAddress: string;
  stopoverAddresses: string[];
  departureTime: string;
  destinationTime: string;
  recommendedRoutes: RecommendedRoute[];
}

export interface RecommendedRoute {
  routeId: string; // 실제 API에서는 routeId로 응답
  name: string;
  timeTaken: number; // min 단위
  arrivalTime: string;
  fatigue: number; // % 단위
}

// 안내시작 API 응답 타입 - 실제로는 숫자(routeId)를 반환
export type RouteStartResponse = number;

// 상세 경로 API 응답 타입
export interface RouteDetailResponse {
  totalTime: number;
  departureTime: string;
  arrivalTime: string;
  fatigue: number;
  data: RouteDetailStep[];
}

export interface RouteDetailStep {
  order: number;
  type: 'SUBWAY' | 'BUS' | 'WALKING';
  lineName: string | null;
  timeTaken: number;
  startPoint: string;
  endPoint: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  path: { lat: number; lng: number }[] | null;
}

export interface RouteApiResponse {
  result: {
    searchType: number;
    outTrafficCheck: number;
    busCount: number;
    subwayCount: number;
    subwayBusCount: number;
    pointDistance: number;
    startRadius: number;
    endRadius: number;
    path: RoutePath[];
  };
}

export interface RoutePath {
  pathType: number;
  info: RouteInfo;
  subPath: SubPath[];
}

export interface RouteInfo {
  trafficDistance: number;
  totalWalk: number;
  totalTime: number;
  payment: number;
  busTransitCount: number;
  subwayTransitCount: number;
  mapObj: string;
  firstStartStation: string;
  lastEndStation: string;
  totalStationCount: number;
  busStationCount: number;
  subwayStationCount: number;
  totalDistance: number;
  totalWalkTime: number;
  checkIntervalTime: number;
  checkIntervalTimeOverYn: string;
  totalIntervalTime: number;
}

export interface SubPath {
  trafficType: number; // 1: 지하철, 3: 도보
  distance: number;
  sectionTime: number;
  stationCount?: number;
  lane?: Lane[];
  intervalTime?: number;
  startName?: string;
  startX?: number;
  startY?: number;
  endName?: string;
  endX?: number;
  endY?: number;
  way?: string;
  wayCode?: number;
  door?: string;
  startID?: number;
  endID?: number;
  startExitNo?: string;
  endExitNo?: string;
  startExitX?: number;
  endExitX?: number;
  startExitY?: number;
  endExitY?: number;
  startStationCityCode?: number;
  startStationProviderCode?: number;
  startLocalStationID?: string;
  startArsID?: string;
  endStationCityCode?: number;
  endStationProviderCode?: number;
  passStopList?: {
    stations: Station[];
  };
  passShape?: {
    geojson: {
      coordinates: number[][];
    };
  };
}

export interface Lane {
  name?: string;
  subwayCode?: number;
  subwayCityCode?: number;
  busNo?: string;
  type?: number;
  busID?: number;
  busLocalBlID?: string;
  busCityCode?: number;
  busProviderCode?: number;
}

export interface Station {
  index: number;
  stationID: number;
  stationName: string;
  x: string;
  y: string;
  stationCityCode?: number;
  stationProviderCode?: number;
  localStationID?: string;
  arsID?: string;
  isNonStop?: string;
}

// 트래픽 타입 상수
export const TRAFFIC_TYPES = {
  SUBWAY: 1,
  BUS: 2,
  WALK: 3,
  AIRPLANE: 4,
  SHIP: 5,
  BICYCLE: 6,
  CAR: 7
} as const;

export type TrafficType = typeof TRAFFIC_TYPES[keyof typeof TRAFFIC_TYPES];

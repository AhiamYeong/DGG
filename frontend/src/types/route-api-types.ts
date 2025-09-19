// test.json 기반 API 응답 타입 정의

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
  startExitX?: number;
  startExitY?: number;
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
  name: string;
  subwayCode: number;
  subwayCityCode: number;
}

export interface Station {
  index: number;
  stationID: number;
  stationName: string;
  x: string;
  y: string;
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

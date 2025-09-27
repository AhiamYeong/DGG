/**
 * 엄격한 타입 정의
 * any 타입을 제거하고 모든 데이터 구조를 명확히 정의
 */

// 기본 위치 정보
export interface StrictLocation {
  latitude: number;
  longitude: number;
  address: string;
  name: string;
}

// 시간 정보
export interface StrictTimeSlot {
  hour: number;
  minute: number;
}

// 장소 정보 (검색 결과)
export interface StrictPlaceInfo {
  name: string;
  address: string;
  roadAddress: string;
  location: StrictLocation;
}

// 경유지 정보
export interface StrictWaypoint {
  id: string;
  name: string;
  address: string;
  roadAddress?: string;
  location?: StrictLocation;
}

// 경로 단계 정보
export interface StrictRouteStep {
  id: string;
  type: 'walk' | 'bus' | 'subway' | 'transfer' | 'taxi' | 'bike';
  description: string;
  duration: number; // 분 단위
  distance?: number; // 미터 단위 (선택사항으로 변경)
  from?: StrictLocation;
  to?: StrictLocation;
  lineInfo?: {
    name: string;
    color: string;
    direction: string;
    stationCount: number;
  };
  departureTime?: StrictTimeSlot;
  arrivalTime?: StrictTimeSlot;
  fare?: number;
  congestionLevel?: 'low' | 'medium' | 'high';
}

// 경로 정보
export interface StrictRoute {
  id: string;
  name: string;
  totalDuration: number; // 분 단위
  totalDistance: number; // 미터 단위
  steps: StrictRouteStep[];
  departureTime: StrictTimeSlot;
  arrivalTime: StrictTimeSlot;
  price?: number;
  isBookmarked?: boolean;
  from: StrictLocation;
  to: StrictLocation;
  recommendationType: 'minTime' | 'minTransfer' | 'minFatigue';
  description: string;
  fatigueLevel?: number; // 0-100
  routeKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API 응답 타입들
export interface StrictApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 경로 검색 API 응답
export interface StrictRouteSearchResponse {
  departureAddress: string;
  destinationAddress: string;
  departureTime: string;
  recommendedRoutes: StrictRecommendedRoute[];
}

export interface StrictRecommendedRoute {
  routeKey: string;
  name: string;
  timeTaken: number;
  arrivalTime: string;
  fatigue?: number;
}

// 경로 상세 정보 API 응답
export interface StrictRouteDetailResponse {
  data: StrictRouteDetailStep[];
  totalTime: number;
  totalDistance: number;
  fatigue: number;
  // 기존 코드와의 호환성을 위한 추가 필드
  subPath?: Array<{
    trafficType: number;
    passShape?: {
      geojson: {
        coordinates: number[][];
      };
    };
    passStopList?: {
      stations: Array<{
        stationName: string;
        x: string;
        y: string;
      }>;
    };
    startX?: number;
    startY?: number;
    endX?: number;
    endY?: number;
    lane?: Array<{
      name: string;
    }>;
  }>;
  polyline?: {
    result: {
      lane: StrictLaneData[];
    };
  };
}

export interface StrictRouteDetailStep {
  type: 'SUBWAY' | 'BUS' | 'WALKING';
  lineName?: string;
  startPoint?: string;
  endPoint?: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  timeTaken: number;
  path?: Array<{
    lat: number;
    lng: number;
  }>;
  etaMin?: number; // 버스 도착 예정 시간
}

// 폴리라인 데이터
export interface StrictPolylineData {
  result: {
    lane: StrictLaneData[];
  };
}

export interface StrictLaneData {
  type: number;
  name: string;
  section: StrictSectionData[];
}

export interface StrictSectionData {
  graphPos: Array<{
    x: number;
    y: number;
  }>;
}

// 즐겨찾기 경로
export interface StrictBookmarkRoute {
  bookmarkRouteId: number;
  name: string;
  departureName: string;
  destinationName: string;
  createdAt: string;
  updatedAt: string;
}

// 검색 히스토리
export interface StrictSearchHistory {
  id: string;
  query: string;
  resultCount: number;
  timestamp: string;
  userId?: string;
}

// 즐겨찾기 장소
export interface StrictFavoritePlace {
  id: string;
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
  coordinates: {
    x: number;
    y: number;
  };
  createdAt: string;
  userId?: string;
}

// 에러 상태
export interface StrictErrorState {
  hasError: boolean;
  errorMessage: string | null;
  errorCode?: string;
  retryCount: number;
}

// 로딩 상태
export interface StrictLoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

// 검색 상태
export interface StrictSearchState {
  query: string;
  results: StrictPlaceInfo[];
  isLoading: boolean;
  error: StrictErrorState | null;
}

// 네비게이션 상태
export interface StrictNavigationState {
  isNavigating: boolean;
  currentRoute: StrictRoute | null;
  currentStepIndex: number;
  isRouteCompleted: boolean;
  sideSheetPosition: number;
  sideSheetMode: 'collapsed' | 'normal' | 'expanded';
}

// 지도 상태
export interface StrictMapState {
  currentLocation: StrictLocation;
  isLoaded: boolean;
  zoom: number;
  center: StrictLocation;
}

// UI 상태
export interface StrictUIState {
  showTimePicker: boolean;
  showDepartureOptions: boolean;
  showRouteResults: boolean;
  activeTab: 'recent' | 'favorite';
}

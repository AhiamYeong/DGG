import type { SimpleRoute, RouteStep } from '../types/route-types';
import type { Location, TimeSlot } from '../types/common-types';

/**
 * 경로 추천 결과를 위한 더미 데이터 생성기
 */

// 현재 시간 기준으로 시간 슬롯 생성
const createTimeSlot = (minutesFromNow: number): TimeSlot => {
  const now = new Date();
  const time = new Date(now.getTime() + minutesFromNow * 60000);
  
  return {
    hour: time.getHours(),
    minute: time.getMinutes()
  };
};

// 기본 위치 데이터
const createLocation = (name: string, address: string): Location => ({
  name,
  address,
  latitude: 37.5665 + (Math.random() - 0.5) * 0.1,
  longitude: 126.9780 + (Math.random() - 0.5) * 0.1
});

// 경로 단계 생성
const createRouteStep = (
  type: 'walk' | 'bus' | 'subway' | 'transfer',
  description: string,
  duration: number,
  distance?: number,
  lineInfo?: { name: string; color: string; direction: string; stationCount?: number }
): RouteStep => ({
  id: `step-${Math.random().toString(36).substr(2, 9)}`,
  type,
  description,
  duration,
  distance,
  lineInfo,
  createdAt: new Date(),
  updatedAt: new Date()
});

/**
 * 경로 추천 결과 더미 데이터 생성 (주석화)
 */
export const generateRouteRecommendations = (
  from: string,
  to: string,
  departureTime?: TimeSlot
): SimpleRoute[] => {
  // 더미 데이터 생성 기능을 주석화
  throw new Error('더미 데이터 생성 기능이 비활성화되었습니다. 실제 API를 사용하세요.');
  
  /*
  // const now = new Date();
  // const isCurrentTime = !departureTime || 
  //   (departureTime.hour === now.getHours() && 
  //    Math.abs(departureTime.minute - now.getMinutes()) <= 30);

  const baseDepartureTime = departureTime || createTimeSlot(0);
  const fromLocation = createLocation(from, `${from}역`);
  const toLocation = createLocation(to, `${to}역`);

  // 1. 최소 피로도 경로 (걷기 최소화, 환승 적음)
  const minFatigueRoute: SimpleRoute = {
    id: 'route-min-fatigue',
    name: '최소 피로도',
    totalDuration: 45,
    totalDistance: 8500,
    departureTime: baseDepartureTime,
    arrivalTime: createTimeSlot(45),
    price: 1450,
    from: fromLocation,
    to: toLocation,
    recommendationType: 'minFatigue',
    description: '걷기 최소화, 편안한 경로',
    steps: [
      createRouteStep('walk', '출발지에서 지하철역까지', 3, 200),
      createRouteStep('subway', '2호선 이용', 25, 0, {
        name: '2호선',
        color: '#00A651',
        direction: '강남방면',
        stationCount: 8
      }),
      createRouteStep('transfer', '환승', 2, 0),
      createRouteStep('subway', '3호선 이용', 10, 0, {
        name: '3호선',
        color: '#FF6600',
        direction: '수서방면',
        stationCount: 3
      }),
      createRouteStep('walk', '도착지까지', 5, 300)
    ],
    isBookmarked: false,
    fatigueLevel: 40, // 최소 피로도
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // 2. 최소 시간 경로 (빠른 경로)
  const minTimeRoute: SimpleRoute = {
    id: 'route-min-time',
    name: '최소 시간',
    totalDuration: 32,
    totalDistance: 12000,
    departureTime: baseDepartureTime,
    arrivalTime: createTimeSlot(32),
    price: 2150,
    from: fromLocation,
    to: toLocation,
    recommendationType: 'minTime',
    description: '가장 빠른 경로',
    steps: [
      createRouteStep('walk', '출발지에서 버스정류장까지', 2, 150),
      createRouteStep('bus', '간선버스 이용', 20, 0, {
        name: '146번',
        color: '#0066CC',
        direction: '강남방면'
      }),
      createRouteStep('walk', '도착지까지', 10, 800)
    ],
    isBookmarked: true,
    fatigueLevel: 90, // 최소 시간 (높은 피로도)
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // 3. 최소 환승 경로 (환승 최소화)
  const minTransferRoute: SimpleRoute = {
    id: 'route-min-transfer',
    name: '최소 환승',
    totalDuration: 38,
    totalDistance: 9500,
    departureTime: baseDepartureTime,
    arrivalTime: createTimeSlot(38),
    price: 1650,
    from: fromLocation,
    to: toLocation,
    recommendationType: 'minTransfer',
    description: '환승 최소화 경로',
    steps: [
      createRouteStep('walk', '출발지에서 지하철역까지', 4, 250),
      createRouteStep('subway', '1호선 이용', 30, 0, {
        name: '1호선',
        color: '#003DA5',
        direction: '서울역방면',
        stationCount: 12
      }),
      createRouteStep('walk', '도착지까지', 4, 200)
    ],
    isBookmarked: false,
    fatigueLevel: 60, // 최소 환승 (중간 피로도)
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return [minFatigueRoute, minTimeRoute, minTransferRoute];
  */
};

/**
 * 현재 시간 기준으로 CTA 라벨 결정
 */
export const getActionLabel = (departureTime?: TimeSlot): string => {
  if (!departureTime) return '안내 시작';
  
  const now = new Date();
  const departure = new Date();
  departure.setHours(departureTime.hour, departureTime.minute, 0, 0);
  
  const timeDiff = departure.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  
  // 30분 이내면 현재 시간으로 간주
  if (minutesDiff <= 30) {
    return '안내 시작';
  } else {
    return '예약하기';
  }
};



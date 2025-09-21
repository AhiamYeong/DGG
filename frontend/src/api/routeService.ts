// import { generateRouteRecommendations } from '../utils/routeDataGenerator'; // 주석화됨
import { isCurrentTime, getActionLabel, formatDateTimeForApi } from '../utils/timeUtils';
import { searchRoutesWithTime, startRouteGuidance, getRouteDetail } from './mapApi';
import type { SimpleRoute } from '../types/route-types';
import type { NewBackendRouteApiResponse, RecommendedRoute, RouteStartResponse, RouteDetailResponse } from '../types/route-api-types';
import { log } from '../utils/logger';
import { getFatigueLevel } from '../constants';

// 기존 API 응답 타입 (백엔드용) - 사용하지 않음
// interface BackendRouteApiResponse {
//   departureAddress: string;
//   destinationAddress: string;
//   recommendedRoutes: RecommendedRoute[];
// }

// interface RecommendedRoute {
//   routeId?: number;
//   name?: string;
//   timeTaken?: number;
//   arrivalTime?: string;
//   fatigue?: number;
// }

/**
 * 경로 검색 관련 비즈니스 로직을 담당하는 서비스 클래스
 */
export class RouteService {
  /**
   * test.json 데이터 로드 (주석화)
   * @returns test.json의 경로 데이터
   */
  static async loadTestRouteData(): Promise<any> {
    // test.json 데이터 로드 기능을 주석화
    throw new Error('test.json 데이터 로드 기능이 비활성화되었습니다. 실제 API를 사용하세요.');
    
    /*
    try {
      const { default: testData } = await import('./testData');
      return testData;
    } catch (error) {
      log.error('test.json 로드 실패:', error);
      throw error;
    }
    */
  }

  /**
   * 경로 검색 실행
   * @param origin 출발지
   * @param destination 도착지
   * @returns 경로 추천 결과
   */
  static async searchRoutes(_origin: string, _destination: string): Promise<SimpleRoute[]> {
    try {
      // test.json 데이터 사용 (주석화)
      // const testData = await this.loadTestRouteData();
      // return this.convertTestDataToRoutes(testData, origin, destination);
      
      // 더미 데이터 반환 (주석화)
      // return generateRouteRecommendations(origin, destination);
      
      // 실제 API 호출로 변경
      throw new Error('실제 API 호출을 사용하세요');
    } catch (error) {
      log.error('경로 검색 실패:', error);
      // 폴백: 더미 데이터 반환 (주석화)
      // return generateRouteRecommendations(origin, destination);
      throw error;
    }
  }

  /**
   * 출발 옵션과 시간에 따른 액션 라벨 결정
   * @param departureTime 출발 시간
   * @param option 출발 옵션
   * @returns 액션 라벨
   */
  static calculateActionLabel(
    departureTime: Date, 
    option: 'now' | 'schedule'
  ): string {
    return getActionLabel(departureTime, option);
  }

  /**
   * 현재 시간인지 확인
   * @param time 확인할 시간
   * @returns 현재 시간 여부
   */
  static isCurrentTime(time: Date): boolean {
    return isCurrentTime(time);
  }

  /**
   * 경로 검색 플로우 실행
   * @param origin 출발지
   * @param destination 도착지
   * @param departureTime 출발 시간
   * @param selectedOption 출발 옵션
   * @param waypoints 경유지 (선택사항)
   * @returns 경로 검색 결과와 액션 라벨
   */
  static async executeRouteSearchFlow(
    origin: string,
    destination: string,
    departureTime: Date,
    selectedOption: 'now' | 'schedule',
    waypoints?: string[],
    originName?: string,
    destinationName?: string
  ): Promise<{
    routes: SimpleRoute[];
    actionLabel: string;
  }> {
    log.route('경로 검색 플로우 실행', {
      origin,
      destination,
      departureTime,
      selectedOption,
      waypoints
    });

    try {
      // 시간을 API 형식으로 변환
      const startTime = formatDateTimeForApi(departureTime);
      
      // 백엔드 API 호출
      const apiResponse = await searchRoutesWithTime(
        origin,
        destination,
        startTime,
        waypoints
      );

      // API 응답을 SimpleRoute 형식으로 변환 (지명 사용)
      const routes = this.convertApiResponseToRoutes(apiResponse, originName, destinationName);
      
      // 액션 라벨 결정
      const actionLabel = this.calculateActionLabel(departureTime, selectedOption);

      return {
        routes,
        actionLabel
      };
    } catch (error) {
      log.error('백엔드 API 호출 실패, 더미 데이터 사용:', error);
      
      // 개발 중에는 더미 데이터 사용 (백엔드 API 준비 완료 후 제거)
      console.warn('⚠️ 백엔드 API 호출 실패 - 더미 데이터 사용 중');
      
      // 폴백: 새로운 API 형식의 더미 데이터 사용
      const dummyApiResponse: NewBackendRouteApiResponse = {
        departureAddress: "서울특별시 강남구 강남대로 396", // 도로명 주소 (API 응답 형식)
        destinationAddress: "서울특별시 마포구 마포대로 100", // 도로명 주소 (API 응답 형식)
        stopoverAddresses: waypoints && waypoints.length > 0 ? waypoints.slice(0, 2) : [],
        departureTime: formatDateTimeForApi(departureTime),
        destinationTime: formatDateTimeForApi(new Date(departureTime.getTime() + 50 * 60 * 1000)), // 50분 후
        recommendedRoutes: [
          {
            routeKey: "dummy-route-key-1",
            name: "최소 피로도",
            timeTaken: 48,
            arrivalTime: "2025-12-12 18:46:00",
            fatigue: 40
          },
          {
            routeKey: "dummy-route-key-2",
            name: "최소 시간",
            timeTaken: 38,
            arrivalTime: "2025-12-12 18:36:00",
            fatigue: 90
          },
          {
            routeKey: "dummy-route-key-3",
            name: "최소 환승",
            timeTaken: 45,
            arrivalTime: "2025-12-12 18:43:00",
            fatigue: 60
          }
        ]
      };

      const routes = this.convertApiResponseToRoutes(dummyApiResponse, originName, destinationName);
      const actionLabel = this.calculateActionLabel(departureTime, selectedOption);

      return {
        routes,
        actionLabel
      };
    }
  }

  // convertTestDataToRoutes 메서드 제거됨 (주석화)

  // convertSubPathsToSteps 메서드 제거됨 (주석화)

  /**
   * 새로운 백엔드 API 응답을 SimpleRoute 형식으로 변환
   */
  private static convertApiResponseToRoutes(apiResponse: NewBackendRouteApiResponse, originName?: string, destinationName?: string): SimpleRoute[] {
    if (!apiResponse || !apiResponse.recommendedRoutes) {
      return [];
    }

    return apiResponse.recommendedRoutes.map((route: RecommendedRoute, index: number) => {
      // 출발 시간 파싱
      const departureTimeStr = apiResponse.departureTime;
      const departureTimeMatch = departureTimeStr.match(/(\d{2}):(\d{2}):(\d{2})/);
      const departureTime = departureTimeMatch 
        ? { hour: parseInt(departureTimeMatch[1]), minute: parseInt(departureTimeMatch[2]) }
        : { hour: 0, minute: 0 };

      // 도착 시간 파싱
      const arrivalTimeStr = route.arrivalTime;
      const arrivalTimeMatch = arrivalTimeStr?.match(/(\d{2}):(\d{2}):(\d{2})/);
      const arrivalTime = arrivalTimeMatch 
        ? { hour: parseInt(arrivalTimeMatch[1]), minute: parseInt(arrivalTimeMatch[2]) }
        : { hour: 0, minute: 0 };

      // 피로도 레벨 계산
      const fatigueInfo = getFatigueLevel(route.fatigue || 50);

      return {
        id: route.routeKey || `route-${index}`, // routeKey를 id로 사용
        name: route.name || `경로 ${index + 1}`,
        totalDuration: route.timeTaken || 0,
        totalDistance: 0, // API에서 거리 정보가 없으므로 0으로 설정
        departureTime,
        arrivalTime,
        from: { 
          latitude: 0, 
          longitude: 0, 
          name: originName || apiResponse.departureAddress || '출발지',
          address: apiResponse.departureAddress || '출발지'
        },
        to: { 
          latitude: 0, 
          longitude: 0, 
          name: destinationName || apiResponse.destinationAddress || '도착지',
          address: apiResponse.destinationAddress || '도착지'
        },
        steps: [], // API에서 상세 경로 정보가 없으므로 빈 배열
        recommendationType: this.getRecommendationType(route.name || ''),
        description: `${route.name || `경로 ${index + 1}`} - ${route.timeTaken || 0}분 소요, 피로도 레벨${fatigueInfo.level} (${fatigueInfo.label})`,
        isBookmarked: false,
        fatigueLevel: route.fatigue,
        price: 0, // API에서 가격 정보가 없으므로 0으로 설정
        createdAt: new Date(),
        updatedAt: new Date(),
        // routeKey 저장 (안내시작 시 사용) - API에서는 routeId로 오므로 routeId를 routeKey로 사용
        routeKey: route.routeId
      };
    });
  }

  /**
   * 경로 이름에 따른 추천 타입 결정
   */
  private static getRecommendationType(routeName: string): 'minTime' | 'minTransfer' | 'minFatigue' {
    if (routeName.includes('최소 시간') || routeName.includes('최단 시간')) {
      return 'minTime';
    } else if (routeName.includes('최소 환승') || routeName.includes('최소 환승')) {
      return 'minTransfer';
    } else if (routeName.includes('최소 피로도') || routeName.includes('피로도')) {
      return 'minFatigue';
    }
    return 'minTime'; // 기본값
  }

  /**
   * 경로 선택 처리
   * @param route 선택된 경로
   */
  static handleRouteSelection(route: SimpleRoute): void {
    log.route('경로 선택', route);
    // TODO: 선택된 경로로 네비게이션 시작
    // - 경로 상세 정보 표시
    // - 네비게이션 모드 시작
    // - 실시간 안내 시작
  }

  /**
   * 즐겨찾기 토글
   * @param routeId 경로 ID
   * @param isBookmarked 현재 즐겨찾기 상태
   * @returns 새로운 즐겨찾기 상태
   */
  static toggleBookmark(routeId: string, isBookmarked: boolean): boolean {
    log.route('즐겨찾기 토글', { routeId, isBookmarked: !isBookmarked });
    // TODO: API 호출로 즐겨찾기 상태 변경
    return !isBookmarked;
  }

  /**
   * 경로 옵션 표시
   * @param routeId 경로 ID
   */
  static showRouteOptions(routeId: string): void {
    log.route('경로 옵션 표시', routeId);
    // TODO: 경로 옵션 모달 표시
    // - 경로 상세 정보
    // - 즐겨찾기 추가/제거
    // - 공유하기
    // - 신고하기
  }

  /**
   * 안내시작 처리 (2단계 API 호출)
   * @param routeKey 경로 키
   * @returns 상세 경로 정보
   */
  static async startNavigation(routeKey: string): Promise<RouteDetailResponse> {
    try {
      console.log('=== RouteService.startNavigation 시작 ===');
      console.log('입력 routeKey:', routeKey);
      console.log('routeKey 타입:', typeof routeKey);
      
      log.route('안내시작 처리 시작', { routeKey });

             // 1단계: 안내시작 API 호출
             console.log('=== 1단계: 안내시작 API 호출 ===');
             const startResponse = await startRouteGuidance(routeKey);
             console.log('안내시작 API 응답:', startResponse);
             console.log('응답 타입:', typeof startResponse);
             
             // 응답이 숫자인 경우와 객체인 경우 모두 처리
             const routeId = typeof startResponse === 'number' ? startResponse.toString() : startResponse.routeId;
             console.log('routeId:', routeId);
             console.log('routeId 타입:', typeof routeId);
      
      log.route('안내시작 API 응답', startResponse);

             // 2단계: 상세 경로 조회 API 호출
             console.log('=== 2단계: 상세 경로 조회 API 호출 ===');
             const routeDetail: RouteDetailResponse = await getRouteDetail(routeId);
      console.log('상세 경로 조회 완료:', routeDetail);
      console.log('상세 경로 타입:', typeof routeDetail);
      
      log.route('상세 경로 조회 완료', routeDetail);

      console.log('=== RouteService.startNavigation 성공 ===');
      return routeDetail;
    } catch (error: any) {
      console.log('=== RouteService.startNavigation 에러 ===');
      console.log('에러 객체:', error);
      console.log('에러 메시지:', error.message);
      console.log('에러 스택:', error.stack);
      
      log.error('안내시작 처리 실패', error);
      throw error;
    }
  }

  /**
   * 상세 경로 데이터를 RouteStep 형식으로 변환
   * @param detailData 상세 경로 데이터
   * @returns RouteStep 배열
   */
  static convertDetailDataToSteps(detailData: RouteDetailResponse): any[] {
    if (!detailData || !detailData.data) {
      return [];
    }

    return detailData.data
      .filter(step => step.timeTaken > 0) // 시간이 0인 단계는 제외
      .map((step, index) => {
        // 교통수단 타입 변환
        let type: string;
        let description: string;
        
        switch (step.type) {
          case 'SUBWAY':
            type = 'subway';
            if (step.startPoint && step.endPoint) {
              description = `${step.startPoint} → ${step.endPoint}`;
            } else if (step.lineName) {
              description = `${step.lineName} 이용`;
            } else {
              description = '지하철 이용';
            }
            break;
          case 'BUS':
            type = 'bus';
            if (step.startPoint && step.endPoint) {
              description = `${step.startPoint} → ${step.endPoint}`;
            } else if (step.lineName) {
              description = `${step.lineName} 이용`;
            } else {
              description = '버스 이용';
            }
            break;
          case 'WALKING':
            type = 'walk';
            if (step.startPoint && step.endPoint) {
              description = `${step.startPoint} → ${step.endPoint} 도보`;
            } else {
              description = '도보';
            }
            break;
          default:
            type = 'walk';
            description = '도보';
        }

        return {
          id: `step-${step.order || index}`,
          type,
          description,
          duration: step.timeTaken,
          distance: 0, // API에서 거리 정보가 없으므로 0으로 설정
          lineInfo: step.lineName ? {
            name: step.lineName,
            direction: step.endPoint || '',
            stationCount: 0
          } : undefined,
          stations: [],
          startName: step.startPoint || '',
          endName: step.endPoint || '',
          startLocation: step.startLat && step.startLng ? {
            latitude: step.startLat,
            longitude: step.startLng
          } : undefined,
          endLocation: step.endLat && step.endLng ? {
            latitude: step.endLat,
            longitude: step.endLng
          } : undefined,
          path: step.path || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });
  }
}


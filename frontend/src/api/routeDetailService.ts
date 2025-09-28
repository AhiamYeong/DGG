import type { SimpleRoute } from '@/types/route-types';

// JSON 데이터 타입 정의
interface RouteDetailData {
  totalTime: number;
  departureTime: string;
  arrivalTime: string;
  fatigue: number;
  data: RouteStep[];
}

interface RouteStep {
  order: number;
  type: string;
  lineName: string | null;
  timeTaken: number;
  startPoint: string | null;
  endPoint: string | null;
  startLat: number | null;
  startLng: number | null;
  endLat: number | null;
  endLng: number | null;
  path: StationPoint[];
  etaMin: number | null;
  polyline: any[];
}

interface StationPoint {
  seq: number;
  name: string;
  stationId: string;
  lat: number;
  lng: number;
}

/**
 * 경로 상세 데이터 서비스
 */
export class RouteDetailService {
  private static routeDataCache: Map<string, RouteDetailData> = new Map();

  /**
   * 경로 타입에 따른 JSON 데이터 로드
   */
  static async loadRouteDetail(routeType: 'minFatigue' | 'minTime' | 'minTransfer'): Promise<RouteDetailData> {
    // 캐시에서 먼저 확인
    if (this.routeDataCache.has(routeType)) {
      return this.routeDataCache.get(routeType)!;
    }

    try {
      let data: RouteDetailData;
      
      switch (routeType) {
        case 'minFatigue':
          data = await import('../stores/최소피로도.json');
          break;
        case 'minTime':
          data = await import('../stores/최단경로.json');
          break;
        case 'minTransfer':
          data = await import('../stores/최소환승.json');
          break;
        default:
          throw new Error(`지원하지 않는 경로 타입: ${routeType}`);
      }

      // 캐시에 저장
      this.routeDataCache.set(routeType, data);
      return data;
    } catch (error) {
      throw new Error(`경로 상세 데이터 로드 실패: ${error}`);
    }
  }

  /**
   * 경로 데이터를 SimpleRoute 형식으로 변환
   */
  static convertToSimpleRoute(
    routeData: RouteDetailData, 
    routeType: 'minFatigue' | 'minTime' | 'minTransfer',
    originName: string,
    destinationName: string
  ): SimpleRoute {
    // 출발/도착 시간 파싱
    const departureTime = this.parseTimeString(routeData.departureTime);
    const arrivalTime = this.parseTimeString(routeData.arrivalTime);

    // 경로 이름 결정
    const routeName = this.getRouteName(routeType);

    return {
      id: `${routeType}-${Date.now()}`,
      name: routeName,
      totalDuration: routeData.totalTime,
      departureTime,
      arrivalTime,
      from: {
        latitude: 0,
        longitude: 0,
        name: originName,
        address: originName
      },
      to: {
        latitude: 0,
        longitude: 0,
        name: destinationName,
        address: destinationName
      },
      steps: this.convertSteps(routeData.data),
      recommendationType: routeType,
      description: `${routeName} - ${routeData.totalTime}분 소요, 피로도 레벨${this.getFatigueLevel(routeData.fatigue).level} (${this.getFatigueLevel(routeData.fatigue).label})`,
      isBookmarked: false,
      fatigueLevel: routeData.fatigue,
      createdAt: new Date(),
      updatedAt: new Date(),
      // 원본 데이터 저장 (폴리라인 그리기용)
      rawData: routeData,
      polylineData: this.extractPolylineData(routeData.data)
    };
  }

  /**
   * 시간 문자열을 TimeSlot 형식으로 파싱
   */
  private static parseTimeString(timeStr: string): { hour: number; minute: number } {
    const [, time] = timeStr.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    return { hour, minute };
  }

  /**
   * 경로 타입에 따른 이름 반환
   */
  private static getRouteName(routeType: 'minFatigue' | 'minTime' | 'minTransfer'): string {
    switch (routeType) {
      case 'minFatigue':
        return '최소 피로도';
      case 'minTime':
        return '최단 경로';
      case 'minTransfer':
        return '최소 환승';
      default:
        return '경로';
    }
  }

  /**
   * 경로 단계 데이터 변환
   */
  private static convertSteps(data: RouteStep[]): any[] {
    // 0분인 도보 단계는 제외 (수도권 도보 노드 포함)
    const filteredData = data.filter(step => {
      if (step.type === 'WALKING' && step.timeTaken === 0) {
        return false;
      }
      return true;
    });
    
    return filteredData.map(step => ({
      id: `step-${step.order}`,
      type: this.convertTransportType(step.type),
      description: this.generateStepDescription(step),
      duration: step.timeTaken,
      distance: 0, // 거리 정보는 제거됨
      from: step.startLat && step.startLng ? {
        latitude: step.startLat,
        longitude: step.startLng,
        name: step.startPoint || '',
        address: step.startPoint || ''
      } : undefined,
      to: step.endLat && step.endLng ? {
        latitude: step.endLat,
        longitude: step.endLng,
        name: step.endPoint || '',
        address: step.endPoint || ''
      } : undefined,
      lineInfo: step.lineName ? {
        name: step.lineName,
        color: this.getLineColor(step.lineName),
        direction: step.endPoint || '',
        stationCount: step.path.length
      } : undefined,
      departureTime: step.etaMin ? this.calculateDepartureTime(step.etaMin) : undefined,
      arrivalTime: step.etaMin ? this.calculateArrivalTime(step.etaMin, step.timeTaken) : undefined,
      fare: 0, // 요금 정보는 제거됨
      congestionLevel: 'medium' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  /**
   * 교통수단 타입 변환
   */
  private static convertTransportType(type: string): 'walk' | 'bus' | 'subway' | 'transfer' | 'taxi' | 'bike' {
    switch (type) {
      case 'WALKING':
        return 'walk';
      case 'SUBWAY':
        return 'subway';
      case 'BUS':
        return 'bus';
      case 'TRANSFER':
        return 'transfer';
      default:
        return 'walk';
    }
  }

  /**
   * 단계별 설명 생성
   */
  private static generateStepDescription(step: RouteStep): string {
    switch (step.type) {
      case 'WALKING':
        return `${step.startPoint || '출발지'}에서 ${step.endPoint || '도착지'}까지 도보`;
      case 'SUBWAY':
        return `${step.lineName} ${step.startPoint} → ${step.endPoint}`;
      case 'BUS':
        return `${step.lineName} ${step.startPoint} → ${step.endPoint}`;
      case 'TRANSFER':
        return `${step.startPoint}에서 ${step.endPoint}로 환승`;
      default:
        return `${step.timeTaken}분 소요`;
    }
  }

  /**
   * 노선 색상 반환
   */
  private static getLineColor(lineName: string): string {
    if (lineName.includes('1호선')) return '#003DA5';
    if (lineName.includes('2호선')) return '#00A651';
    if (lineName.includes('3호선')) return '#FF6600';
    if (lineName.includes('4호선')) return '#00A5DE';
    if (lineName.includes('5호선')) return '#996CAC';
    if (lineName.includes('6호선')) return '#CD7C2F';
    if (lineName.includes('7호선')) return '#747F00';
    if (lineName.includes('8호선')) return '#E6186C';
    if (lineName.includes('9호선')) return '#BDB092';
    return '#666666';
  }

  /**
   * 피로도 레벨 정보 반환
   */
  private static getFatigueLevel(fatigue: number): { level: number; label: string; color: string } {
    if (fatigue <= 20) return { level: 1, label: '매우 낮음', color: '#4CAF50' };
    if (fatigue <= 40) return { level: 2, label: '낮음', color: '#8BC34A' };
    if (fatigue <= 60) return { level: 3, label: '보통', color: '#FFC107' };
    if (fatigue <= 80) return { level: 4, label: '높음', color: '#FF9800' };
    return { level: 5, label: '매우 높음', color: '#F44336' };
  }

  /**
   * 폴리라인 데이터 추출
   */
  private static extractPolylineData(data: RouteStep[]): any {
    return {
      result: {
        lane: data
          .filter(step => step.polyline && step.polyline.length > 0)
          .map(step => ({
            class: step.type === 'SUBWAY' ? 2 : 1,
            type: this.getLineType(step.lineName),
            name: step.lineName || '도보',
            section: [{
              graphPos: step.polyline.map(point => ({ x: point[1], y: point[0] }))
            }]
          })),
        boundary: this.calculateBoundary(data)
      }
    };
  }

  /**
   * 노선 타입 코드 반환
   */
  private static getLineType(lineName: string | null): number {
    if (!lineName) return 1; // 도보
    if (lineName.includes('1호선')) return 1;
    if (lineName.includes('2호선')) return 2;
    if (lineName.includes('3호선')) return 3;
    if (lineName.includes('4호선')) return 4;
    if (lineName.includes('5호선')) return 5;
    if (lineName.includes('6호선')) return 6;
    if (lineName.includes('7호선')) return 7;
    if (lineName.includes('8호선')) return 8;
    if (lineName.includes('9호선')) return 9;
    return 1;
  }

  /**
   * 경계 계산
   */
  private static calculateBoundary(data: RouteStep[]): { top: number; left: number; bottom: number; right: number } {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

    data.forEach(step => {
      if (step.startLat && step.startLng) {
        minLat = Math.min(minLat, step.startLat);
        maxLat = Math.max(maxLat, step.startLat);
        minLng = Math.min(minLng, step.startLng);
        maxLng = Math.max(maxLng, step.startLng);
      }
      if (step.endLat && step.endLng) {
        minLat = Math.min(minLat, step.endLat);
        maxLat = Math.max(maxLat, step.endLat);
        minLng = Math.min(minLng, step.endLng);
        maxLng = Math.max(maxLng, step.endLng);
      }
    });

    return { top: maxLat, left: minLng, bottom: minLat, right: maxLng };
  }

  /**
   * 출발 시간 계산
   */
  private static calculateDepartureTime(etaMin: number): { hour: number; minute: number } {
    const now = new Date();
    const departure = new Date(now.getTime() + etaMin * 60000);
    return { hour: departure.getHours(), minute: departure.getMinutes() };
  }

  /**
   * 도착 시간 계산
   */
  private static calculateArrivalTime(etaMin: number, timeTaken: number): { hour: number; minute: number } {
    const now = new Date();
    const arrival = new Date(now.getTime() + (etaMin + timeTaken) * 60000);
    return { hour: arrival.getHours(), minute: arrival.getMinutes() };
  }
}

import { generateRouteRecommendations } from '../utils/routeDataGenerator';
import { isCurrentTime, getActionLabel } from '../utils/timeUtils';
import type { SimpleRoute } from '../types/routes';

/**
 * 경로 검색 관련 비즈니스 로직을 담당하는 서비스 클래스
 */
export class RouteService {
  /**
   * 경로 검색 실행
   * @param origin 출발지
   * @param destination 도착지
   * @returns 경로 추천 결과
   */
  static async searchRoutes(origin: string, destination: string): Promise<SimpleRoute[]> {
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await routeSearchApi.searchRoute({ origin, destination });
      // return response.routes;
      
      // 현재는 더미 데이터 사용
      return generateRouteRecommendations(origin, destination);
    } catch (error) {
      console.error('경로 검색 실패:', error);
      // 폴백: 더미 데이터 반환
      return generateRouteRecommendations(origin, destination);
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
   * @returns 경로 검색 결과와 액션 라벨
   */
  static async executeRouteSearchFlow(
    origin: string,
    destination: string,
    departureTime: Date,
    selectedOption: 'now' | 'schedule'
  ): Promise<{
    routes: SimpleRoute[];
    actionLabel: string;
  }> {
    console.log('=== 경로 검색 플로우 실행 ===');
    console.log('출발지:', origin);
    console.log('도착지:', destination);
    console.log('출발 시간:', departureTime);
    console.log('출발 옵션:', selectedOption);
    console.log('============================');

    // 경로 검색
    const routes = await this.searchRoutes(origin, destination);
    
    // 액션 라벨 결정
    const actionLabel = this.calculateActionLabel(departureTime, selectedOption);

    return {
      routes,
      actionLabel
    };
  }

  /**
   * 경로 선택 처리
   * @param route 선택된 경로
   */
  static handleRouteSelection(route: SimpleRoute): void {
    console.log('경로 선택:', route);
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
    console.log('즐겨찾기 토글:', { routeId, isBookmarked: !isBookmarked });
    // TODO: API 호출로 즐겨찾기 상태 변경
    return !isBookmarked;
  }

  /**
   * 경로 옵션 표시
   * @param routeId 경로 ID
   */
  static showRouteOptions(routeId: string): void {
    console.log('경로 옵션 표시:', routeId);
    // TODO: 경로 옵션 모달 표시
    // - 경로 상세 정보
    // - 즐겨찾기 추가/제거
    // - 공유하기
    // - 신고하기
  }
}


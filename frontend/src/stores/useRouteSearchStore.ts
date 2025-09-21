import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNavigationStore } from './useNavigationStore';
import type { SimpleRoute, PlaceInfo } from '../types/route-types';
import { log } from '../utils/logger';

interface RouteSearchState {
  // 검색 결과 관련
  routeResults: SimpleRoute[];
  actionLabel: string;
  showDepartureOptions: boolean;
  
  // 현재 검색 중인 출발지/도착지 (통합된 주소 정보)
  currentOrigin: PlaceInfo | null;
  currentDestination: PlaceInfo | null;
  currentWaypoints?: PlaceInfo[];
  
  // 시간 선택 관련
  showTimePicker: boolean;
  departureTime: Date;
  selectedDepartureOption: 'now' | 'schedule';
  
  // 검색 히스토리
  searchHistory: Array<{
    id: string;
    origin: string;
    destination: string;
    waypoints?: string[];
    timestamp: number;
  }>;
}

interface RouteSearchActions {
  // 검색 플로우
  startRouteSearch: (origin: PlaceInfo, destination: PlaceInfo, waypoints?: PlaceInfo[]) => void;
  confirmTimeSelection: () => Promise<void>;
  cancelTimeSelection: () => void;
  closeRouteResults: () => void;
  
  // 시간 선택
  setDepartureTime: (time: Date) => void;
  setSelectedDepartureOption: (option: 'now' | 'schedule') => void;
  
  // 경로 선택 (안내시작)
  selectRoute: (route: SimpleRoute) => Promise<void>;
  
  // 검색 히스토리
  addSearchHistory: (origin: string, destination: string, waypoints?: string[]) => void;
  clearSearchHistory: () => void;
  
  // 상태 초기화
  reset: () => void;
}

const initialState: RouteSearchState = {
  routeResults: [],
  actionLabel: '안내 시작',
  showDepartureOptions: false,
  currentOrigin: null,
  currentDestination: null,
  currentWaypoints: undefined,
  showTimePicker: false,
  departureTime: new Date(),
  selectedDepartureOption: 'now',
  searchHistory: [],
};

export const useRouteSearchStore = create<RouteSearchState & RouteSearchActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 검색 시작
      startRouteSearch: (origin: PlaceInfo, destination: PlaceInfo, waypoints?: PlaceInfo[]) => {
        log.route('길찾기 요청', { origin, destination, waypoints });
        
        // 현재 검색 중인 출발지/도착지 저장 (통합된 주소 정보)
        set({ 
          currentOrigin: origin,
          currentDestination: destination,
          currentWaypoints: waypoints
        });
        
        // 검색 히스토리 추가
        get().addSearchHistory(origin.name, destination.name, waypoints?.map(wp => wp.name));
        
        // 출발 옵션 탭 표시 (경로 결과 페이지)
        set({ 
          showDepartureOptions: true,
          routeResults: [] // 초기에는 빈 배열
        });
      },

      // 시간 선택 확인
      confirmTimeSelection: async () => {
        const { departureTime, selectedDepartureOption, currentOrigin, currentDestination, currentWaypoints } = get();
        
        
        try {
          // 현재 검색 중인 출발지/도착지 사용
          if (!currentOrigin || !currentDestination) {
            log.error('출발지 또는 도착지가 설정되지 않았습니다');
            return;
          }
          
          // API 호출시에는 도로명 주소를 사용
          const apiOrigin = currentOrigin.address;
          const apiDestination = currentDestination.address;
          const apiWaypoints = currentWaypoints?.map(wp => wp.address);
          
          // RouteService를 통한 실제 API 호출
          const { RouteService } = await import('../api/routeService');
          const result = await RouteService.executeRouteSearchFlow(
            apiOrigin,
            apiDestination,
            departureTime,
            selectedDepartureOption,
            apiWaypoints,
            currentOrigin.name,  // 지명 (표시용)
            currentDestination.name  // 지명 (표시용)
          );
          
          log.route('API 호출 결과', result);
          
          set({ 
            routeResults: result.routes,
            actionLabel: result.actionLabel,
            showTimePicker: false,
            showDepartureOptions: true
          });
        } catch (error) {
          log.error('경로 검색 실패', error);
          // API 실패시 전역 상태 초기화
          get().reset();
        }
      },

      // 시간 선택 취소
      cancelTimeSelection: () => {
        set({ showTimePicker: false });
      },

      // 경로 결과 닫기
      closeRouteResults: () => {
        set({ 
          routeResults: [],
          showDepartureOptions: false,
          currentOrigin: null,
          currentDestination: null,
          currentWaypoints: undefined
        });
      },

      // 출발 시간 설정
      setDepartureTime: (time: Date) => {
        set({ departureTime: time });
      },

      // 출발 옵션 설정
      setSelectedDepartureOption: (option: 'now' | 'schedule') => {
        set({ selectedDepartureOption: option });
        if (option === 'now') {
          set({ departureTime: new Date() });
          // 지금 출발하기 선택 시 바로 경로 검색
          get().confirmTimeSelection();
        } else if (option === 'schedule') {
          // 출발예약 선택 시 타임픽커 모달 열기
          set({ showTimePicker: true });
        }
      },

      // 경로 선택 (안내시작)
      selectRoute: async (route: SimpleRoute) => {
        log.route('경로 선택 (안내시작)', route);
        
        try {
          // routeKey가 있는지 확인
          if (!route.routeKey) {
            throw new Error('경로 키가 없습니다. 다시 검색해주세요.');
          }

          // RouteService를 사용하여 2단계 API 호출
          const { RouteService } = await import('../api/routeService');
          const routeDetail = await RouteService.startNavigation(route.routeKey);
          
          // 상세 경로 데이터를 steps로 변환
          const steps = RouteService.convertDetailDataToSteps(routeDetail);
          
          // route 객체에 상세 정보 업데이트
          const updatedRoute: SimpleRoute = {
            ...route,
            steps: steps,
            totalDuration: routeDetail.totalTime,
            fatigueLevel: routeDetail.fatigue
          };

          // 네비게이션 시작
          useNavigationStore.getState().startNavigation(updatedRoute);
          // 검색 결과 화면 닫기
          get().closeRouteResults();
        } catch (error) {
          log.error('안내시작 실패', error);
          // 에러 처리 (사용자에게 알림)
          alert('안내시작에 실패했습니다. 다시 시도해주세요.');
        }
      },

      // 검색 히스토리 추가
      addSearchHistory: (origin: string, destination: string, waypoints?: string[]) => {
        const { searchHistory } = get();
        const newEntry = {
          id: `search-${Date.now()}`,
          origin,
          destination,
          waypoints,
          timestamp: Date.now()
        };
        
        // 최대 10개까지만 유지
        const updatedHistory = [newEntry, ...searchHistory].slice(0, 10);
        set({ searchHistory: updatedHistory });
      },

      // 검색 히스토리 초기화
      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      // 상태 초기화
      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'route-search-store',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        selectedDepartureOption: state.selectedDepartureOption,
      }),
    }
  )
);


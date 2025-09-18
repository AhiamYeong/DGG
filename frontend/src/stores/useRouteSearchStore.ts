import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateRouteRecommendations } from '../utils/routeDataGenerator';
import { getActionLabel } from '../utils/timeUtils';
import { useNavigationStore } from './useNavigationStore';
import type { SimpleRoute } from '../types/route-types';

interface RouteSearchState {
  // 검색 결과 관련
  routeResults: SimpleRoute[];
  actionLabel: string;
  showDepartureOptions: boolean;
  
  // 시간 선택 관련
  showTimePicker: boolean;
  departureTime: Date;
  selectedDepartureOption: 'now' | 'schedule';
  
  // 검색 히스토리
  searchHistory: Array<{
    id: string;
    origin: string;
    destination: string;
    timestamp: number;
  }>;
}

interface RouteSearchActions {
  // 검색 플로우
  startRouteSearch: (origin: string, destination: string) => void;
  confirmTimeSelection: () => Promise<void>;
  cancelTimeSelection: () => void;
  closeRouteResults: () => void;
  
  // 시간 선택
  setDepartureTime: (time: Date) => void;
  setSelectedDepartureOption: (option: 'now' | 'schedule') => void;
  
  // 경로 선택
  selectRoute: (route: SimpleRoute) => void;
  
  // 검색 히스토리
  addSearchHistory: (origin: string, destination: string) => void;
  clearSearchHistory: () => void;
  
  // 상태 초기화
  reset: () => void;
}

const initialState: RouteSearchState = {
  routeResults: [],
  actionLabel: '안내 시작',
  showDepartureOptions: false,
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
      startRouteSearch: (origin: string, destination: string) => {
        console.log('=== 길찾기 요청 ===');
        console.log('출발지:', origin);
        console.log('도착지:', destination);
        console.log('==================');
        
        // 검색 히스토리 추가
        get().addSearchHistory(origin, destination);
        
        // 출발 옵션 탭 표시 (경로 결과 페이지)
        set({ 
          showDepartureOptions: true,
          routeResults: [] // 초기에는 빈 배열
        });
      },

      // 시간 선택 확인
      confirmTimeSelection: async () => {
        const { departureTime, selectedDepartureOption, searchHistory } = get();
        
        try {
          // 최근 검색 기록에서 출발지/도착지 가져오기
          const lastSearch = searchHistory[0];
          if (!lastSearch) {
            console.error('검색 기록이 없습니다');
            return;
          }
          
          // TimeSlot 형식으로 변환
          const timeSlot = {
            hour: departureTime.getHours(),
            minute: departureTime.getMinutes()
          };
          
          // 3개 경로 생성
          const routes = generateRouteRecommendations(
            lastSearch.origin,
            lastSearch.destination,
            timeSlot
          );
          
          console.log('생성된 경로 개수:', routes.length);
          console.log('경로 목록:', routes.map(r => ({ id: r.id, name: r.name })));
          
          // 액션 라벨 결정
          const actionLabel = getActionLabel(departureTime, selectedDepartureOption);
          
          set({ 
            routeResults: routes,
            actionLabel,
            showTimePicker: false,
            showDepartureOptions: true
          });
        } catch (error) {
          console.error('경로 검색 실패:', error);
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
          showDepartureOptions: false
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

      // 경로 선택
      selectRoute: (route: SimpleRoute) => {
        console.log('경로 선택:', route);
        // 네비게이션 시작
        useNavigationStore.getState().startNavigation(route);
        // 검색 결과 화면 닫기
        get().closeRouteResults();
      },

      // 검색 히스토리 추가
      addSearchHistory: (origin: string, destination: string) => {
        const { searchHistory } = get();
        const newEntry = {
          id: `search-${Date.now()}`,
          origin,
          destination,
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


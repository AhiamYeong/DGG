import { create } from 'zustand';
import type { SimpleRoute } from '../types/route-types';

interface NavigationState {
  // 네비게이션 상태
  isNavigating: boolean;
  currentRoute: SimpleRoute | null;
  
  // 사이드 시트 상태
  sideSheetPosition: number; // 0, 20, 70 (0: 닫힘, 20: 보통상태, 70: 확장상태)
  sideSheetMode: 'collapsed' | 'normal' | 'expanded'; // 사이드바 모드
  
  // 경로 진행 상태
  currentStepIndex: number;
  isRouteCompleted: boolean;
}

interface NavigationActions {
  // 네비게이션 시작/종료
  startNavigation: (route: SimpleRoute) => void;
  stopNavigation: () => void;
  
  // 사이드 시트 제어
  closeSideSheet: () => void;
  setSideSheetPosition: (position: number) => void;
  toggleSideSheetMode: () => void; // 보통상태 ↔ 확장상태 전환
  
  // 경로 진행 관리
  setCurrentStep: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeRoute: () => void;
  
  // 상태 초기화
  reset: () => void;
}

const initialState: NavigationState = {
  isNavigating: false,
  currentRoute: null,
  sideSheetPosition: 0,
  sideSheetMode: 'collapsed',
  currentStepIndex: 0,
  isRouteCompleted: false,
};

export const useNavigationStore = create<NavigationState & NavigationActions>()(
  (set, get) => ({
    ...initialState,

    // 네비게이션 시작
    startNavigation: (route: SimpleRoute) => {
      set({
        isNavigating: true,
        currentRoute: route,
        currentStepIndex: 0,
        isRouteCompleted: false,
        sideSheetPosition: 20, // 20% 상태로 시작
        sideSheetMode: 'normal',
      });
      
      // 선택된 경로의 폴리라인과 마커 그리기
      if (route.rawData) {
        // useMapViewModel에서 drawSelectedRoute와 createSelectedRouteMarkers 호출
        // 이는 MainMapPage에서 처리됨
      }
    },

    // 네비게이션 종료
    stopNavigation: () => {
      set({
        isNavigating: false,
        currentRoute: null,
        currentStepIndex: 0,
        isRouteCompleted: false,
        sideSheetPosition: 0,
        sideSheetMode: 'collapsed',
      });
    },

    // 사이드 시트 닫기 (실제로는 20%로 유지)
    closeSideSheet: () => {
      set({
        sideSheetPosition: 20, // 완전히 닫지 않고 20% 유지
        sideSheetMode: 'normal',
      });
    },

    // 사이드 시트 위치 설정
    setSideSheetPosition: (position: number) => {
      const clampedPosition = Math.max(20, Math.min(70, position)); // 최소 20% 유지
      let mode: 'collapsed' | 'normal' | 'expanded' = 'normal';
      
      if (clampedPosition < 35) {
        mode = 'normal';
      } else {
        mode = 'expanded';
      }
      
      set({
        sideSheetPosition: clampedPosition,
        sideSheetMode: mode,
      });
    },

    // 사이드바 모드 토글 (보통상태 ↔ 확장상태)
    toggleSideSheetMode: () => {
      const { sideSheetMode } = get();
      if (sideSheetMode === 'normal') {
        set({
          sideSheetPosition: 70,
          sideSheetMode: 'expanded',
        });
      } else if (sideSheetMode === 'expanded') {
        set({
          sideSheetPosition: 20,
          sideSheetMode: 'normal',
        });
      }
    },

    // 현재 단계 설정
    setCurrentStep: (stepIndex: number) => {
      const { currentRoute } = get();
      if (currentRoute && stepIndex >= 0 && stepIndex < currentRoute.steps.length) {
        set({ currentStepIndex: stepIndex });
      }
    },

    // 다음 단계
    nextStep: () => {
      const { currentRoute, currentStepIndex } = get();
      if (currentRoute && currentStepIndex < currentRoute.steps.length - 1) {
        set({ currentStepIndex: currentStepIndex + 1 });
      }
    },

    // 이전 단계
    previousStep: () => {
      const { currentStepIndex } = get();
      if (currentStepIndex > 0) {
        set({ currentStepIndex: currentStepIndex - 1 });
      }
    },

    // 경로 완료
    completeRoute: () => {
      set({
        isRouteCompleted: true,
        isNavigating: false,
      });
    },

    // 상태 초기화
    reset: () => {
      set(initialState);
    },
  })
);

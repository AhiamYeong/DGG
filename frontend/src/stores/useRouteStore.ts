import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RouteTabType } from '../types/routes';

interface FavoriteRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  time: string;
  isBookmarked: boolean;
}

interface ReservedRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  time: string;
  isBookmarked: boolean;
  reservationTime: string;
  isActive: boolean;
  reminderMinutes?: number;
}

interface RouteState {
  selectedRoute: FavoriteRoute | ReservedRoute | null;
  favoriteRoutes: FavoriteRoute[];
  reservedRoutes: ReservedRoute[];
  activeTab: RouteTabType;
  isGuidanceMode: boolean;
  currentStep: number;
  totalSteps: number;
}

interface RouteActions {
  selectRoute: (route: FavoriteRoute | ReservedRoute) => void;
  addFavoriteRoute: (route: Omit<FavoriteRoute, 'id'>) => void;
  addReservedRoute: (route: Omit<ReservedRoute, 'id'>) => void;
  removeFavoriteRoute: (id: string) => void;
  removeReservedRoute: (id: string) => void;
  toggleBookmark: (id: string, type: RouteTabType) => void;
  setActiveTab: (tab: RouteTabType) => void;
  startGuidance: () => void;
  stopGuidance: () => void;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (step: number) => void;
}

export const useRouteStore = create<RouteState & RouteActions>()(
  persist(
    (set, get) => ({
      // State
      selectedRoute: null,
      favoriteRoutes: [], // 더미 데이터 제거, API에서 로드
      reservedRoutes: [], // 더미 데이터 제거, API에서 로드
      activeTab: 'favorite',
      isGuidanceMode: false,
      currentStep: 0,
      totalSteps: 0,

  // Actions
  selectRoute: (route) => set({ selectedRoute: route }),
  
  addFavoriteRoute: (route) => {
    const { favoriteRoutes } = get();
    const newRoute: FavoriteRoute = {
      ...route,
      id: `route-${Date.now()}`
    };
    set({ favoriteRoutes: [...favoriteRoutes, newRoute] });
  },

  addReservedRoute: (route) => {
    const { reservedRoutes } = get();
    const newRoute: ReservedRoute = {
      ...route,
      id: `reserved-${Date.now()}`
    };
    set({ reservedRoutes: [...reservedRoutes, newRoute] });
  },

  removeFavoriteRoute: (id) => {
    const { favoriteRoutes } = get();
    set({ favoriteRoutes: favoriteRoutes.filter(route => route.id !== id) });
  },

  removeReservedRoute: (id) => {
    const { reservedRoutes } = get();
    set({ reservedRoutes: reservedRoutes.filter(route => route.id !== id) });
  },

  toggleBookmark: (id, type) => {
    const { favoriteRoutes, reservedRoutes } = get();
    
    if (type === 'favorite') {
      set({
        favoriteRoutes: favoriteRoutes.map(route =>
          route.id === id ? { ...route, isBookmarked: !route.isBookmarked } : route
        )
      });
    } else {
      set({
        reservedRoutes: reservedRoutes.map(route =>
          route.id === id ? { ...route, isBookmarked: !route.isBookmarked } : route
        )
      });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  startGuidance: () => set({ isGuidanceMode: true, currentStep: 0 }),
  stopGuidance: () => set({ isGuidanceMode: false, currentStep: 0 }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

      setCurrentStep: (step) => set({ currentStep: step })
    }),
    {
      name: 'route-store',
      partialize: (state) => ({
        favoriteRoutes: state.favoriteRoutes,
        reservedRoutes: state.reservedRoutes,
        activeTab: state.activeTab,
      }),
    }
  )
);

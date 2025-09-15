import { create } from 'zustand';

interface FavoriteRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  time: string;
  isBookmarked: boolean;
}

interface RouteState {
  selectedRoute: FavoriteRoute | null;
  favoriteRoutes: FavoriteRoute[];
  isGuidanceMode: boolean;
  currentStep: number;
  totalSteps: number;
}

interface RouteActions {
  selectRoute: (route: FavoriteRoute) => void;
  addFavoriteRoute: (route: Omit<FavoriteRoute, 'id'>) => void;
  removeFavoriteRoute: (id: string) => void;
  toggleBookmark: (id: string) => void;
  startGuidance: () => void;
  stopGuidance: () => void;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (step: number) => void;
}

export const useRouteStore = create<RouteState & RouteActions>((set, get) => ({
  // State
  selectedRoute: null,
  favoriteRoutes: [
    {
      id: '1',
      name: '출근길',
      from: '강남역',
      to: '여의도',
      time: '08:30',
      isBookmarked: true
    },
    {
      id: '2',
      name: '퇴근길',
      from: '여의도',
      to: '강남역',
      time: '18:00',
      isBookmarked: true
    },
    {
      id: '3',
      name: '주말 나들이',
      from: '홍대입구역',
      to: '명동',
      time: '14:00',
      isBookmarked: false
    }
  ],
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

  removeFavoriteRoute: (id) => {
    const { favoriteRoutes } = get();
    set({ favoriteRoutes: favoriteRoutes.filter(route => route.id !== id) });
  },

  toggleBookmark: (id) => {
    const { favoriteRoutes } = get();
    set({
      favoriteRoutes: favoriteRoutes.map(route =>
        route.id === id ? { ...route, isBookmarked: !route.isBookmarked } : route
      )
    });
  },

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
}));

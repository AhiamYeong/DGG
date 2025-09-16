import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '../types/common';

// 경유지 타입 정의
export interface Waypoint {
  id: string;
  value: string;
  location?: Location;
}

interface SearchState {
  origin: string;
  destination: string;
  waypoints: Waypoint[];
  // recentSearches는 API로 관리하므로 제거
}

interface SearchActions {
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  addWaypoint: () => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, value: string) => void;
  clearOrigin: () => void;
  clearDestination: () => void;
  clearWaypoint: (id: string) => void;
  clearAll: () => void;
  // addRecentSearch는 API로 관리하므로 제거
}

export const useSearchStore = create<SearchState & SearchActions>()(
  persist(
    (set, get) => ({
      // State
      origin: '',
      destination: '',
      waypoints: [],

  // Actions
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  
  addWaypoint: () => {
    const { waypoints } = get();
    if (waypoints.length < 2) {
      const newWaypoint: Waypoint = {
        id: `waypoint-${Date.now()}`,
        value: ''
      };
      set({ waypoints: [...waypoints, newWaypoint] });
    }
  },

  removeWaypoint: (id) => {
    const { waypoints } = get();
    set({ waypoints: waypoints.filter(wp => wp.id !== id) });
  },

  updateWaypoint: (id, value) => {
    const { waypoints } = get();
    set({
      waypoints: waypoints.map(wp => 
        wp.id === id ? { ...wp, value } : wp
      )
    });
  },

  clearOrigin: () => set({ origin: '' }),
  clearDestination: () => set({ destination: '' }),
  
  clearWaypoint: (id) => {
    const { waypoints } = get();
    set({
      waypoints: waypoints.map(wp => 
        wp.id === id ? { ...wp, value: '' } : wp
      )
    });
  },

      clearAll: () => set({ 
        origin: '', 
        destination: '', 
        waypoints: [] 
      }),
    }),
    {
      name: 'search-store',
      partialize: (state) => ({
        origin: state.origin,
        destination: state.destination,
        waypoints: state.waypoints,
      }),
    }
  )
);

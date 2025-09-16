import { create } from 'zustand';

interface Waypoint {
  id: string;
  value: string;
}

interface SearchState {
  origin: string;
  destination: string;
  waypoints: Waypoint[];
  recentSearches: string[];
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
  addRecentSearch: (search: string) => void;
}

export const useSearchStore = create<SearchState & SearchActions>((set, get) => ({
  // State
  origin: '',
  destination: '',
  waypoints: [],
  recentSearches: [],

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

  addRecentSearch: (search) => {
    const { recentSearches } = get();
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 10);
    set({ recentSearches: updated });
  }
}));

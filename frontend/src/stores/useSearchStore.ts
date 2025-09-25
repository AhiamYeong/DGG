/** @format */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Location } from "../types/common-types";
import { ROUTE_CONSTANTS } from "../constants";

// 경유지 타입 정의
export interface Waypoint {
  id: string;
  value: string;
  location?: Location;
  roadAddress?: string; // 도로명 주소 추가
}

interface SearchState {
  origin: string;
  destination: string;
  waypoints: Waypoint[];
  // 도로명 주소 별도 저장
  originRoadAddress?: string;
  destinationRoadAddress?: string;
  // recentSearches는 API로 관리하므로 제거
}

interface SearchActions {
  setOrigin: (origin: string, roadAddress?: string) => void;
  setDestination: (destination: string, roadAddress?: string) => void;
  addWaypoint: () => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, value: string, roadAddress?: string) => void;
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
      origin: "",
      destination: "",
      waypoints: [],
      originRoadAddress: undefined,
      destinationRoadAddress: undefined,

      // Actions
      setOrigin: (origin, roadAddress) =>
        set({ origin, originRoadAddress: roadAddress }),
      setDestination: (destination, roadAddress) =>
        set({ destination, destinationRoadAddress: roadAddress }),

      addWaypoint: () => {
        const { waypoints } = get();
        if (waypoints.length < ROUTE_CONSTANTS.MAX_WAYPOINTS) {
          const newWaypoint: Waypoint = {
            id: `waypoint-${Date.now()}`,
            value: "",
          };
          set({ waypoints: [...waypoints, newWaypoint] });
        }
      },

      removeWaypoint: (id) => {
        const { waypoints } = get();
        set({ waypoints: waypoints.filter((wp) => wp.id !== id) });
      },

      updateWaypoint: (id, value, roadAddress) => {
        const { waypoints } = get();
        set({
          waypoints: waypoints.map((wp) =>
            wp.id === id ? { ...wp, value, roadAddress } : wp
          ),
        });
      },

      clearOrigin: () => set({ origin: "", originRoadAddress: undefined }),
      clearDestination: () =>
        set({ destination: "", destinationRoadAddress: undefined }),

      clearWaypoint: (id) => {
        const { waypoints } = get();
        set({
          waypoints: waypoints.map((wp) =>
            wp.id === id ? { ...wp, value: "", roadAddress: undefined } : wp
          ),
        });
      },

      clearAll: () =>
        set({
          origin: "",
          destination: "",
          waypoints: [],
          originRoadAddress: undefined,
          destinationRoadAddress: undefined,
        }),
    }),
    {
      name: "search-store",
      partialize: (state) => ({
        origin: state.origin,
        destination: state.destination,
        waypoints: state.waypoints,
        originRoadAddress: state.originRoadAddress,
        destinationRoadAddress: state.destinationRoadAddress,
      }),
    }
  )
);

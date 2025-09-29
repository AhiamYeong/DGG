/** @format */

import { create } from "zustand";
import {
  fatigueApi,
  fatigueHistory,
  MainFatigueProps,
} from "@/api/fatigueApi";

interface FatigueState {
  fatigue: number;
  nickname: string;
  historyData: fatigueHistory[];
  fetchFatigue: () => Promise<void>;
  fetchFatigueHistory: () => Promise<void>;
  updateFatigue: (
    reason: "COFFEE" | "WALK" | "NAP",
    fatigue_change: number
  ) => Promise<void>;
}

export const useFatigueStore = create<FatigueState>((set, get) => ({
  fatigue: 0,
  nickname: "",
  historyData: [],

  fetchFatigue: async () => {
    try {
      const res = await fatigueApi.get("/fatigues");
      const data: MainFatigueProps = res.data;
      set({ fatigue: data.current_fatigue, nickname: data.nickname });
    } catch (err) {
      console.error("Error fetching fatigue data:", err);
    }
  },

  fetchFatigueHistory: async () => {
    try {
      const res = await fatigueApi.get("/fatigues/daily");
      const data: fatigueHistory[] = res.data;
      set({ historyData: data });
    } catch (error) {
      console.error("Error fetching fatigue history:", error);
    }
  },

  updateFatigue: async (reason, fatigue_change) => {
    try {
      const resp = await fatigueApi.put("/fatigues", {
        reason,
        fatigue_change,
      });
      const updated = resp.data;

      // Optimistic update
      set((state) => ({
        fatigue: updated.fatigue,
        historyData: [
          {
            fatigueId: Date.now(), // 임시 ID
            created_at: updated.created_at,
            reason: updated.reason,
            fatigue: updated.fatigue,
            fatigue_change: updated.fatigue_change,
          },
          ...state.historyData,
        ],
      }));

      // Fetch history to sync
      await get().fetchFatigueHistory();
      // Also update the current fatigue level from the latest fetch if needed, though PUT response is likely sufficient
      set({ fatigue: updated.fatigue });
    } catch (error) {
      console.error("Failed to update fatigue:", error);
    }
  },
}));

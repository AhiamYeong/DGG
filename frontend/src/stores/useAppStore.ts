import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 앱 전역 상태 타입
interface AppState {
  // UI 상태
  isLoading: boolean;
  error: string | null;
  
  // 사용자 설정
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  
  // 앱 상태
  isOnline: boolean;
  lastSyncTime: Date | null;
}

interface AppActions {
  // UI 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 사용자 설정 관리
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ko' | 'en') => void;
  
  // 앱 상태 관리
  setOnlineStatus: (isOnline: boolean) => void;
  updateSyncTime: () => void;
  
  // 유틸리티
  reset: () => void;
}

const initialState: AppState = {
  isLoading: false,
  error: null,
  theme: 'light',
  language: 'ko',
  isOnline: true,
  lastSyncTime: null,
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // UI 상태 관리
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // 사용자 설정 관리
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),

      // 앱 상태 관리
      setOnlineStatus: (isOnline) => set({ isOnline }),
      updateSyncTime: () => set({ lastSyncTime: new Date() }),

      // 유틸리티
      reset: () => set(initialState),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

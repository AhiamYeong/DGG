/**
 * 통합된 검색 스토어
 * 기존의 useSearchStore, useRouteSearchStore, useRouteStore를 통합
 * 책임을 명확히 분리하고 상태 중복을 제거
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  StrictPlaceInfo, 
  StrictWaypoint, 
  StrictRoute,
  StrictBookmarkRoute,
  StrictSearchHistory,
  StrictErrorState
} from '../types/strict-types';
import { log } from '../utils/logger';

// 통합된 검색 상태
interface UnifiedSearchState {
  // 검색 입력 상태
  searchInput: {
    origin: string;
    destination: string;
    waypoints: StrictWaypoint[];
    originRoadAddress?: string;
    destinationRoadAddress?: string;
  };
  
  // 검색 결과 상태
  searchResults: {
    routes: StrictRoute[];
    isLoading: boolean;
    error: StrictErrorState | null;
  };
  
  // 현재 검색 컨텍스트
  currentSearch: {
    origin: StrictPlaceInfo | null;
    destination: StrictPlaceInfo | null;
    waypoints: StrictPlaceInfo[];
  };
  
  // 출발 옵션 상태
  departureOptions: {
    showTimePicker: boolean;
    showDepartureOptions: boolean;
    departureTime: Date;
    selectedOption: 'now' | 'schedule';
    actionLabel: string;
  };
  
  // 즐겨찾기 및 히스토리
  favorites: {
    routes: StrictBookmarkRoute[];
    places: StrictPlaceInfo[];
    searchHistory: StrictSearchHistory[];
  };
  
  // UI 상태
  ui: {
    activeTab: 'recent' | 'favorite';
    showRouteResults: boolean;
  };
}

// 통합된 검색 액션
interface UnifiedSearchActions {
  // 검색 입력 관리
  setOrigin: (origin: string, roadAddress?: string) => void;
  setDestination: (destination: string, roadAddress?: string) => void;
  addWaypoint: () => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, name: string, roadAddress?: string) => void;
  clearOrigin: () => void;
  clearDestination: () => void;
  clearWaypoint: (id: string) => void;
  clearAllInputs: () => void;
  
  // 검색 실행
  executeSearch: (origin: StrictPlaceInfo, destination: StrictPlaceInfo, waypoints?: StrictPlaceInfo[]) => Promise<void>;
  confirmTimeSelection: () => Promise<void>;
  cancelTimeSelection: () => void;
  closeSearchResults: () => void;
  
  // 출발 옵션 관리
  setDepartureTime: (time: Date) => void;
  setSelectedDepartureOption: (option: 'now' | 'schedule') => void;
  
  // 경로 관리
  selectRoute: (route: StrictRoute) => Promise<void>;
  toggleBookmark: (routeId: string) => void;
  addBookmarkForRoute: (route: StrictRoute) => Promise<void>;
  removeBookmarkForRoute: (routeId: string) => Promise<void>;
  
  // 즐겨찾기 관리
  fetchBookmarks: () => Promise<void>;
  addSearchHistory: (origin: string, destination: string, waypoints?: string[]) => void;
  clearSearchHistory: () => void;
  
  // UI 관리
  setActiveTab: (tab: 'recent' | 'favorite') => void;
  setShowRouteResults: (show: boolean) => void;
  
  // 에러 관리
  setError: (error: StrictErrorState | null) => void;
  clearError: () => void;
  
  // 상태 초기화
  reset: () => void;
}

// 초기 상태
const initialState: UnifiedSearchState = {
  searchInput: {
    origin: '',
    destination: '',
    waypoints: [],
    originRoadAddress: undefined,
    destinationRoadAddress: undefined,
  },
  searchResults: {
    routes: [],
    isLoading: false,
    error: null,
  },
  currentSearch: {
    origin: null,
    destination: null,
    waypoints: [],
  },
  departureOptions: {
    showTimePicker: false,
    showDepartureOptions: false,
    departureTime: new Date(),
    selectedOption: 'now',
    actionLabel: '안내 시작',
  },
  favorites: {
    routes: [],
    places: [],
    searchHistory: [],
  },
  ui: {
    activeTab: 'recent',
    showRouteResults: false,
  },
};

export const useUnifiedSearchStore = create<UnifiedSearchState & UnifiedSearchActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 검색 입력 관리
      setOrigin: (origin, roadAddress) => {
        set(state => ({
          searchInput: {
            ...state.searchInput,
            origin,
            originRoadAddress: roadAddress,
          },
        }));
      },

      setDestination: (destination, roadAddress) => {
        set(state => ({
          searchInput: {
            ...state.searchInput,
            destination,
            destinationRoadAddress: roadAddress,
          },
        }));
      },

      addWaypoint: () => {
        const { waypoints } = get().searchInput;
        if (waypoints.length < 2) { // 최대 2개
          const newWaypoint: StrictWaypoint = {
            id: `waypoint-${Date.now()}`,
            name: '',
            address: '',
          };
          set(state => ({
            searchInput: {
              ...state.searchInput,
              waypoints: [...waypoints, newWaypoint],
            },
          }));
        }
      },

      removeWaypoint: (id) => {
        set(state => ({
          searchInput: {
            ...state.searchInput,
            waypoints: state.searchInput.waypoints.filter(wp => wp.id !== id),
          },
        }));
      },

      updateWaypoint: (id, name, roadAddress) => {
        set(state => ({
          searchInput: {
            ...state.searchInput,
            waypoints: state.searchInput.waypoints.map(wp =>
              wp.id === id ? { ...wp, name, roadAddress } : wp
            ),
          },
        }));
      },

      clearOrigin: () => {
        set(state => ({
          searchInput: {
            ...state.searchInput,
            origin: '',
            originRoadAddress: undefined,
          },
        }));
      },

      clearDestination: () => {
        set(state => ({
          searchInput: {
            ...state.searchInput,
            destination: '',
            destinationRoadAddress: undefined,
          },
        }));
      },

      clearWaypoint: (id) => {
        set(state => ({
          searchInput: {
            ...state.searchInput,
            waypoints: state.searchInput.waypoints.map(wp =>
              wp.id === id ? { ...wp, name: '', roadAddress: undefined } : wp
            ),
          },
        }));
      },

      clearAllInputs: () => {
        set(() => ({
          searchInput: {
            origin: '',
            destination: '',
            waypoints: [],
            originRoadAddress: undefined,
            destinationRoadAddress: undefined,
          },
        }));
      },

      // 검색 실행
      executeSearch: async (origin, destination, waypoints = []) => {
        log.search('검색 실행', `${origin.name} → ${destination.name}`);
        
        set(state => ({
          currentSearch: { origin, destination, waypoints },
          searchResults: { ...state.searchResults, isLoading: true, error: null },
          departureOptions: { ...state.departureOptions, showDepartureOptions: true },
        }));

        // 검색 히스토리 추가
        get().addSearchHistory(origin.name, destination.name, waypoints.map(wp => wp.name));

        try {
          // RouteService를 통한 실제 API 호출
          const { RouteService } = await import('../api/routeService');
          const result = await RouteService.executeRouteSearchFlow(
            origin.address,
            destination.address,
            get().departureOptions.departureTime,
            get().departureOptions.selectedOption,
            waypoints.map(wp => wp.address),
            origin.name,
            destination.name
          );

          set({
            searchResults: {
              routes: result.routes as StrictRoute[],
              isLoading: false,
              error: null,
            },
            departureOptions: {
              ...get().departureOptions,
              actionLabel: result.actionLabel,
            },
          });
        } catch (error) {
          log.error('검색 실행 실패', error);
          set(state => ({
            searchResults: {
              ...state.searchResults,
              isLoading: false,
              error: {
                hasError: true,
                errorMessage: error instanceof Error ? error.message : '검색에 실패했습니다.',
                retryCount: 0,
              },
            },
          }));
        }
      },

      confirmTimeSelection: async () => {
        const { currentSearch } = get();
        
        if (!currentSearch.origin || !currentSearch.destination) {
          log.error('출발지 또는 도착지가 설정되지 않았습니다');
          return;
        }

        await get().executeSearch(
          currentSearch.origin,
          currentSearch.destination,
          currentSearch.waypoints
        );
      },

      cancelTimeSelection: () => {
        set(state => ({
          departureOptions: {
            ...state.departureOptions,
            showTimePicker: false,
          },
        }));
      },

      closeSearchResults: () => {
        set(state => ({
          searchResults: {
            routes: [],
            isLoading: false,
            error: null,
          },
          departureOptions: {
            ...state.departureOptions,
            showDepartureOptions: false,
          },
          currentSearch: {
            origin: null,
            destination: null,
            waypoints: [],
          },
        }));
      },

      // 출발 옵션 관리
      setDepartureTime: (time) => {
        set(state => ({
          departureOptions: {
            ...state.departureOptions,
            departureTime: time,
          },
        }));
      },

      setSelectedDepartureOption: (option) => {
        set(state => ({
          departureOptions: {
            ...state.departureOptions,
            selectedOption: option,
          },
        }));

        if (option === 'now') {
          set(state => ({
            departureOptions: {
              ...state.departureOptions,
              departureTime: new Date(),
            },
          }));
          get().confirmTimeSelection();
        } else if (option === 'schedule') {
          set(state => ({
            departureOptions: {
              ...state.departureOptions,
              showTimePicker: true,
            },
          }));
        }
      },

      // 경로 관리
      selectRoute: async (route) => {
        log.route('경로 선택', route);
        
        try {
          if (!route.routeKey) {
            throw new Error('경로 키가 없습니다. 다시 검색해주세요.');
          }

          // RouteService를 사용하여 2단계 API 호출
          // const { RouteService } = await import('../api/routeService');
          // const routeDetail = await RouteService.startNavigation(route.routeKey);
          
          // 상세 경로 데이터를 steps로 변환
          // const steps = RouteService.convertDetailDataToSteps(routeDetail);
          
          // 네비게이션 시작 (이벤트 기반으로 변경 예정)
          // useNavigationStore.getState().startNavigation(route);
          
          // 검색 결과 화면 닫기
          get().closeSearchResults();
        } catch (error) {
          log.error('경로 선택 실패', error);
          set(state => ({
            searchResults: {
              ...state.searchResults,
              error: {
                hasError: true,
                errorMessage: '경로 선택에 실패했습니다.',
                retryCount: 0,
              },
            },
          }));
        }
      },

      toggleBookmark: (routeId) => {
        set(state => ({
          searchResults: {
            ...state.searchResults,
            routes: state.searchResults.routes.map(route =>
              route.id === routeId ? { ...route, isBookmarked: !route.isBookmarked } : route
            ),
          },
        }));
      },

      addBookmarkForRoute: async (route) => {
        try {
          if (!route.routeKey) throw new Error('routeKey가 없습니다');
          
          const { favoriteRoutesApi } = await import('../api/favoriteRoutes');
          const created = await favoriteRoutesApi.createRouteBookmark({
            name: route.name,
            departureName: route.from.name,
            destinationName: route.to.name,
            routeKey: route.routeKey,
          });

          // 상태 반영
          set(state => ({
            searchResults: {
              ...state.searchResults,
              routes: state.searchResults.routes.map(r =>
                r.id === route.id ? { ...r, isBookmarked: true } : r
              ),
            },
            favorites: {
              ...state.favorites,
              routes: [...state.favorites.routes, created as StrictBookmarkRoute],
            },
          }));
        } catch (error) {
          log.error('즐겨찾기 추가 실패', error);
        }
      },

      removeBookmarkForRoute: async (routeId) => {
        try {
          const { searchResults } = get();
          const target = searchResults.routes.find(r => r.id === routeId);
          
          if (target?.routeKey) {
            const { favoriteRoutesApi } = await import('../api/favoriteRoutes');
            const bookmarkRouteId = parseInt(target.routeKey.replace('bookmark-', ''));
            await favoriteRoutesApi.deleteRouteBookmark(bookmarkRouteId);
          }

          set(state => ({
            searchResults: {
              ...state.searchResults,
              routes: state.searchResults.routes.map(r =>
                r.id === routeId ? { ...r, isBookmarked: false } : r
              ),
            },
          }));
        } catch (error) {
          log.error('즐겨찾기 제거 실패', error);
        }
      },

      // 즐겨찾기 관리
      fetchBookmarks: async () => {
        try {
          const { favoriteRoutesApi } = await import('../api/favoriteRoutes');
          const routes = await favoriteRoutesApi.getRouteBookmarks();
          set(state => ({
            favorites: {
              ...state.favorites,
              routes: routes as StrictBookmarkRoute[],
            },
          }));
        } catch (error) {
          log.error('즐겨찾기 목록 조회 실패', error);
        }
      },

      addSearchHistory: (origin, destination) => {
        const newEntry: StrictSearchHistory = {
          id: `search-${Date.now()}`,
          query: `${origin} → ${destination}`,
          resultCount: 0,
          timestamp: new Date().toISOString(),
        };
        
        set(state => ({
          favorites: {
            ...state.favorites,
            searchHistory: [newEntry, ...state.favorites.searchHistory].slice(0, 10),
          },
        }));
      },

      clearSearchHistory: () => {
        set(state => ({
          favorites: {
            ...state.favorites,
            searchHistory: [],
          },
        }));
      },

      // UI 관리
      setActiveTab: (tab) => {
        set(state => ({
          ui: {
            ...state.ui,
            activeTab: tab,
          },
        }));
      },

      setShowRouteResults: (show) => {
        set(state => ({
          ui: {
            ...state.ui,
            showRouteResults: show,
          },
        }));
      },

      // 에러 관리
      setError: (error) => {
        set(state => ({
          searchResults: {
            ...state.searchResults,
            error,
          },
        }));
      },

      clearError: () => {
        set(state => ({
          searchResults: {
            ...state.searchResults,
            error: null,
          },
        }));
      },

      // 상태 초기화
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'unified-search-store',
      partialize: (state) => ({
        favorites: state.favorites,
        searchInput: state.searchInput,
        departureOptions: {
          selectedOption: state.departureOptions.selectedOption,
        },
      }),
    }
  )
);

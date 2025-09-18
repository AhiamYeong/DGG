import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RecentSearchList from '../components/functional/Search/RecentSearchList';
import FavoritePlacesList from '../components/functional/Search/FavoritePlacesList';
import SearchResultsList from '../components/functional/Search/SearchResultsList';
import ErrorState from '../components/functional/Search/ErrorState';
import LoadingState from '../components/functional/Search/LoadingState';
import EmptyState from '../components/functional/Search/EmptyState';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { testPlaceSearchApiConnection } from '../services/placeSearchApi';
import { testSearchHistoryApiConnection } from '../services/searchHistoryApi';
import { useSearchStore } from '../stores/useSearchStore';
import { transformRecentSearches, transformFavoritePlaces } from '../utils/dataTransformers';

/**
 * 검색 전용 페이지
 */
export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'recent' | 'favorite'>('recent');
  
  // URL에서 검색 타입과 현재 값 가져오기
  const searchType = location.state?.searchType || 'origin';
  const currentValue = location.state?.currentValue || '';
  const waypointIndex = location.state?.waypointIndex;
  
  // SearchStore에서 상태와 액션 가져오기
  const { waypoints, setOrigin, setDestination, updateWaypoint } = useSearchStore();
  
  // 검색 내역 관리 훅 사용
  const {
    recentSearches,
    favoritePlaces,
    isLoading: historyLoading,
    error: historyError,
    addRecentSearch,
    removeRecentSearch,
    toggleFavoritePlace,
    refreshAll
  } = useSearchHistory();
  
  // 장소 검색 API 훅 사용
  const {
    searchQuery,
    searchState,
    handleSearchChange,
    clearSearch
  } = usePlaceSearch({
    display: 10, // 최대 10개 결과
    sort: 'random' // 정확도순 정렬
  });

  // 컴포넌트 마운트 시 현재 값으로 검색어 설정
  useEffect(() => {
    if (currentValue) {
      handleSearchChange(currentValue);
    }
  }, [currentValue, handleSearchChange]);

  // API 연결 상태 확인 (개발용) - 백그라운드에서 처리
  useEffect(() => {
    // API 연결 확인을 백그라운드에서 처리 (사용자 경험에 영향 없음)
    const checkApiConnections = async () => {
      try {
        // 장소 검색 API 연결 확인
        const placeResult = await testPlaceSearchApiConnection();
        if (placeResult.success) {
          console.log('🔍 장소 검색 API 연결 상태:', placeResult.message);
        } else {
          console.warn('⚠️ 장소 검색 API 연결 실패:', placeResult.message);
        }
        
        // 검색 내역 API 연결 확인
        const historyResult = await testSearchHistoryApiConnection();
        if (historyResult.success) {
          console.log('📚 검색 내역 API 연결 상태:', historyResult.message);
        } else {
          console.warn('⚠️ 검색 내역 API 연결 실패:', historyResult.message);
        }
      } catch (error) {
        console.warn('API 연결 확인 중 오류 (사용자 경험에 영향 없음):', error);
      }
    };
    
    // 즉시 실행하지 않고 약간의 지연 후 실행
    const timeoutId = setTimeout(checkApiConnections, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 검색어 변경 핸들러 (네이버 API 훅에서 제공하는 함수 사용)
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  }, [handleSearchChange]);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: 'recent' | 'favorite') => {
    setActiveTab(tab);
  }, []);

  // 위치 선택 핸들러
  const handleLocationSelect = useCallback((location: any) => {
    console.log('선택된 위치:', location, '타입:', searchType);
    
    // 1. 즉시 SearchStore에 반영 (동기적 처리)
    if (searchType === 'origin') {
      setOrigin(location.name);
    } else if (searchType === 'destination') {
      setDestination(location.name);
    } else if (searchType === 'waypoint' && waypointIndex !== undefined) {
      const waypoint = waypoints[waypointIndex];
      if (waypoint) {
        updateWaypoint(waypoint.id, location.name);
      }
    }
    
    // 2. 즉시 메인 화면으로 돌아가기 (사용자 경험 우선)
    navigate(-1);
    
    // 3. 검색 내역 추가는 백그라운드에서 처리 (비동기적 처리)
    if (searchQuery.trim()) {
      // 백그라운드에서 검색 내역 추가 (await 없이)
      addRecentSearch({
        query: searchQuery,
        resultCount: searchState.results.length
      }).then(() => {
        console.log(`✅ ${location.name}이(가) ${searchType === 'origin' ? '출발지' : searchType === 'destination' ? '도착지' : '경유지'}로 설정되었습니다.`);
      }).catch((error) => {
        console.warn('검색 내역 추가 실패 (사용자 경험에 영향 없음):', error);
      });
    } else {
      console.log(`✅ ${location.name}이(가) ${searchType === 'origin' ? '출발지' : searchType === 'destination' ? '도착지' : '경유지'}로 설정되었습니다.`);
    }
  }, [navigate, searchType, waypointIndex, waypoints, setOrigin, setDestination, updateWaypoint, searchQuery, searchState.results.length, addRecentSearch]);

  // 최근 검색 삭제 핸들러
  const handleDeleteRecent = useCallback(async (id: string) => {
    console.log('최근 검색 삭제:', id);
    await removeRecentSearch(id);
  }, [removeRecentSearch]);

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = useCallback(async (id: string) => {
    console.log('즐겨찾기 토글:', id);
    // 즐겨찾기 목록에서 해당 장소 찾기
    const place = favoritePlaces.find(fav => fav.id === id);
    if (place) {
      await toggleFavoritePlace(place);
    }
  }, [favoritePlaces, toggleFavoritePlace]);


  return (
    <div className="h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="bg-background shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="뒤로가기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 제목 */}
          <h1 className="text-lg font-semibold text-font">
            {searchType === 'origin' && '출발지 검색'}
            {searchType === 'destination' && '도착지 검색'}
            {searchType === 'waypoint' && `경유지 ${waypointIndex !== undefined ? waypointIndex + 1 : ''} 검색`}
          </h1>

          {/* 빈 공간 (레이아웃 균형) */}
          <div className="w-10"></div>
        </div>
      </div>

      {/* 검색 입력창 */}
      <div className="bg-background border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="장소를 검색하세요"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="검색어 지우기"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {searchQuery ? (
        // 검색 결과 영역 (전체 화면)
        <div className="flex-1 overflow-y-auto">
          <div className="px-4">
            {searchState.isLoading ? (
              <LoadingState message="검색 중..." />
            ) : searchState.error ? (
              <ErrorState 
                error={searchState.error}
                onRetry={() => {
                  // 검색 다시 시도
                  handleSearchChange(searchQuery);
                }}
              />
            ) : searchState.results.length === 0 ? (
              <EmptyState
                title="검색 결과가 없습니다"
                description="다른 검색어로 시도해보세요"
                icon="search"
              />
            ) : (
              <SearchResultsList
                results={searchState.results}
                onSelect={handleLocationSelect}
                onToggleFavorite={handleToggleFavorite}
                isLoading={searchState.isLoading}
                error={searchState.error}
                total={searchState.results.length}
              />
            )}
          </div>
        </div>
      ) : (
        // 탭 네비게이션과 내용
        <>
          {/* 탭 네비게이션 */}
          <div className="bg-background border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => handleTabChange('recent')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'recent'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-selected={activeTab === 'recent'}
                role="tab"
              >
                최근 내역
              </button>
              <button
                onClick={() => handleTabChange('favorite')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'favorite'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-selected={activeTab === 'favorite'}
                role="tab"
              >
                즐겨찾는 장소
              </button>
            </div>
          </div>

          {/* 탭 내용 영역 */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4">
              {/* 로딩 상태 */}
              {historyLoading ? (
                <LoadingState message="데이터를 불러오는 중..." />
              ) : historyError ? (
                /* 에러 상태 */
                <ErrorState 
                  error={historyError}
                  onRetry={refreshAll}
                />
              ) : activeTab === 'recent' ? (
                /* 최근 검색 내역 */
                recentSearches.length === 0 ? (
                  <EmptyState
                    title="최근 검색 내역이 없습니다"
                    description="검색한 장소가 여기에 표시됩니다"
                    icon="history"
                  />
                ) : (
                  <RecentSearchList
                    items={transformRecentSearches(recentSearches)}
                    onSelect={handleLocationSelect}
                    onDelete={handleDeleteRecent}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )
              ) : (
                /* 즐겨찾기 장소 */
                favoritePlaces.length === 0 ? (
                  <EmptyState
                    title="즐겨찾는 장소가 없습니다"
                    description="자주 가는 장소를 즐겨찾기에 추가해보세요"
                    icon="favorite"
                  />
                ) : (
                  <FavoritePlacesList
                    items={transformFavoritePlaces(favoritePlaces)}
                    onSelect={handleLocationSelect}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

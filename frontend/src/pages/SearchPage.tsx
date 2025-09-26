import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RecentSearchList, FavoritePlacesList, SearchResultsList } from '../components/search';
import { ErrorState, LoadingState, EmptyState } from '../components/ui';
import { useSearchTabData } from '@/hooks/useSearchTabData';
import { useFavoritePlaceActions } from '@/hooks/useFavoritePlaceActions';
import { searchPlaces, removeBTags } from '@/api/placeSearchApi';
import { testSearchHistoryApiConnection } from '../api/searchHistoryApi';
import { useSearchStore } from '../stores/useSearchStore';
import { log } from '../utils/logger';

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
  
  // 탭 기반 데이터 로딩 훅 사용
  const { items, isLoading: historyLoading, error: historyError, refetch } = useSearchTabData(activeTab);
  const { deleteFavoritePlace } = useFavoritePlaceActions(refetch);

  // 검색 상태 (placeSearchApi 기반)
  const [query, setQuery] = useState('');
  const [searchItems, setSearchItems] = useState<Array<{ id: string; name: string; address: string; isBookmark?: boolean }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 입력 변경 시 300ms 디바운스 검색
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) {
        setSearchItems([]);
        setSearchError(null);
        setSearchLoading(false);
        return;
      }
      try {
        setSearchLoading(true);
        setSearchError(null);
        const response = await searchPlaces(query, { display: 10 });
        const mapped = response.items.map((item, idx) => ({
          id: `${removeBTags(item.title)}-${idx}`,
          name: removeBTags(item.title),
          address: item.roadAddress || item.address,
          isBookmark: false,
        }));
        setSearchItems(mapped);
      } catch (e) {
        setSearchError(e instanceof Error ? e.message : '검색에 실패했습니다.');
        setSearchItems([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // 초기 검색어 설정
  useEffect(() => {
    if (currentValue) {
      setQuery(currentValue);
    }
  }, [currentValue]);

  // API 연결 상태 확인 (개발용) - 백그라운드에서 처리
  useEffect(() => {
    // API 연결 확인을 백그라운드에서 처리 (사용자 경험에 영향 없음)
    const checkApiConnections = async () => {
      try {
        // 검색 내역 API 연결 확인
        const historyResult = await testSearchHistoryApiConnection();
        if (historyResult.success) {
          log.info('📚 검색 내역 API 연결 상태:', historyResult.message);
        } else {
          log.warn('⚠️ 검색 내역 API 연결 실패:', historyResult.message);
        }
      } catch (error) {
        log.warn('API 연결 확인 중 오류 (사용자 경험에 영향 없음):', error);
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
    setQuery(e.target.value);
  }, []);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: 'recent' | 'favorite') => {
    setActiveTab(tab);
  }, []);

  // 위치 선택 핸들러
  const handleLocationSelect = useCallback((item: { id: string; name: string; address: string }) => {
    log.search('선택된 위치', searchType, item);
    
    // 1. 즉시 SearchStore에 반영 (동기적 처리)
    const locationName = item.name;
    const roadAddress = item.address;
    
    if (searchType === 'origin') {
      setOrigin(locationName, roadAddress);
    } else if (searchType === 'destination') {
      setDestination(locationName, roadAddress);
    } else if (searchType === 'waypoint' && waypointIndex !== undefined) {
      const waypoint = waypoints[waypointIndex];
      if (waypoint) {
        updateWaypoint(waypoint.id, locationName, roadAddress);
      }
    }
    
    // 2. 즉시 메인 화면으로 돌아가기 (사용자 경험 우선)
    navigate(-1);
    
    // 3. 검색 내역 추가는 백그라운드에서 처리 (비동기적 처리)
    log.search('위치 설정 완료', `${item.name}이(가) ${searchType === 'origin' ? '출발지' : searchType === 'destination' ? '도착지' : '경유지'}로 설정되었습니다.`);
  }, [navigate, searchType, waypointIndex, waypoints, setOrigin, setDestination, updateWaypoint]);

  // 최근 검색 삭제 핸들러
  const handleDeleteRecent = useCallback(async (_id: string) => {
    // 삭제 훅/API 연동 필요 시 구현
  }, []);

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = useCallback(async (_id: string) => {
    // 즐겨찾기 토글 훅/API 연동 필요 시 구현
  }, []);


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
            value={query}
            onChange={handleSearchInputChange}
            placeholder="장소를 검색하세요"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
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

      {query ? (
        // 검색 결과 영역 (전체 화면)
        <div className="flex-1 overflow-y-auto">
          <div className="px-4">
            {searchLoading ? (
              <LoadingState message="검색 중..." />
            ) : searchError ? (
              <ErrorState 
                error={searchError}
                onRetry={() => {
                  const q = query;
                  setQuery('');
                  setTimeout(() => setQuery(q), 0);
                }}
              />
            ) : searchItems.length === 0 ? (
              <EmptyState
                title="검색 결과가 없습니다"
                description="다른 검색어로 시도해보세요"
                icon="search"
              />
            ) : (
              <SearchResultsList
                items={searchItems}
                onSelect={handleLocationSelect}
                isLoading={searchLoading}
                error={searchError}
                total={searchItems.length}
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
                <ErrorState error={historyError} onRetry={refetch} />
              ) : activeTab === 'recent' ? (
                /* 최근 검색 내역 */
                items.length === 0 ? (
                  <EmptyState
                    title="최근 검색 내역이 없습니다"
                    description="검색한 장소가 여기에 표시됩니다"
                    icon="history"
                  />
                ) : (
                  <RecentSearchList
                    items={Array.isArray(items) ? items
                      .filter((item): item is import('@/types/api-types').RecentSearchApiResponse => 'query' in item)
                      .map(item => ({
                        id: item.id,
                        name: item.query,
                        address: '',
                        timestamp: new Date(item.timestamp)
                      })) : []}
                    onSelect={(item) => handleLocationSelect({
                      id: item.id,
                      name: item.name,
                      address: item.address
                    })}
                    onDelete={handleDeleteRecent}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )
              ) : (
                /* 즐겨찾기 장소 */
                items.length === 0 ? (
                  <EmptyState
                    title="즐겨찾는 장소가 없습니다"
                    description="자주 가는 장소를 즐겨찾기에 추가해보세요"
                    icon="favorite"
                  />
                ) : (
                  <FavoritePlacesList
                    items={Array.isArray(items) ? items
                      .filter((item): item is import('@/types/api-types').FavoritePlaceApiResponse => 'title' in item)
                      .map(item => ({
                        bookmarkPlaceId: parseInt(item.id),
                        placeName: item.title,
                        address: item.address
                      })) : []}
                    onSelect={(item) => handleLocationSelect({
                      id: String(item.bookmarkPlaceId),
                      name: item.placeName,
                      address: item.address
                    })}
                    onDeleteFavorite={(id) => deleteFavoritePlace(id)}
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

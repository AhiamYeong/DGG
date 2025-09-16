import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * SearchPage - 검색 전용 페이지
 * React 19 최신 패턴 적용:
 * - useState를 활용한 로컬 상태 관리
 * - useCallback을 통한 이벤트 핸들러 최적화
 * - 접근성(a11y) 고려한 UI 구성
 */
export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'favorite'>('recent');
  
  // 라우터 state에서 검색 타입과 현재 값 가져오기
  const searchType = location.state?.searchType || 'origin';
  const currentValue = location.state?.currentValue || '';

  // 컴포넌트 마운트 시 현재 값으로 검색어 설정
  useEffect(() => {
    if (currentValue) {
      setSearchQuery(currentValue);
    }
  }, [currentValue]);

  // 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: 'recent' | 'favorite') => {
    setActiveTab(tab);
  }, []);

  // 위치 선택 핸들러 (추후 구현 예정)
  // const handleLocationSelect = useCallback((location: string) => {
  //   // TODO: 선택된 위치를 SearchStore에 반영
  //   console.log('선택된 위치:', location, '타입:', searchType);
  //   navigate(-1);
  // }, [navigate, searchType]);

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
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
            {searchType === 'waypoint' && '경유지 검색'}
          </h1>

          {/* 빈 공간 (레이아웃 균형) */}
          <div className="w-10"></div>
        </div>
      </div>

      {/* 검색 입력창 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="장소를 검색하세요"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
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

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
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
        {searchQuery ? (
          // 검색 결과 영역 (추후 구현)
          <div className="p-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">검색 결과가 여기에 표시됩니다</p>
              <p className="text-gray-400 text-xs mt-1">"{searchQuery}"</p>
            </div>
          </div>
        ) : (
          // 탭 내용 (추후 구현)
          <div className="p-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'recent' ? (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {activeTab === 'recent' ? '최근 검색 내역이 없습니다' : '즐겨찾는 장소가 없습니다'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {activeTab === 'recent' ? '검색한 장소가 여기에 표시됩니다' : '자주 가는 장소를 즐겨찾기에 추가해보세요'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

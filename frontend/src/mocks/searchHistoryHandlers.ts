import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'https://j13a305.p.ssafy.io/api';

// 검색 기록 목록 (메모리 기반)
let mockSearchHistory = [
  {
    id: "1",
    query: "강남역",
    timestamp: "2024-01-20T15:30:00Z"
  },
  {
    id: "2",
    query: "홍대입구역",
    timestamp: "2024-01-20T14:15:00Z"
  },
  {
    id: "3",
    query: "서울역",
    timestamp: "2024-01-20T13:45:00Z"
  },
  {
    id: "4",
    query: "명동",
    timestamp: "2024-01-20T12:20:00Z"
  },
  {
    id: "5",
    query: "이태원",
    timestamp: "2024-01-20T11:10:00Z"
  }
];

// 검색 기록 관련 핸들러
export const searchHistoryHandlers = [
  // 최근 검색 기록 조회
  http.get(`${API_BASE_URL}/v1/search/recent`, () => {
    // 최신순으로 정렬
    const sortedHistory = mockSearchHistory.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return HttpResponse.json({
      success: true,
      data: sortedHistory
    });
  }),

  // 검색 기록 추가
  http.post(`${API_BASE_URL}/v1/search/recent`, async ({ request }) => {
    const body = await request.json() as any;
    
    // 중복 검색어 제거
    mockSearchHistory = mockSearchHistory.filter(item => item.query !== body.query);
    
    const newSearch = {
      id: (mockSearchHistory.length + 1).toString(),
      query: body.query,
      timestamp: new Date().toISOString()
    };

    // 맨 앞에 추가
    mockSearchHistory.unshift(newSearch);

    // 최대 20개까지만 유지
    if (mockSearchHistory.length > 20) {
      mockSearchHistory = mockSearchHistory.slice(0, 20);
    }

    return HttpResponse.json({
      success: true,
      data: newSearch
    });
  }),

  // 검색 기록 삭제
  http.delete(`${API_BASE_URL}/v1/search/recent/:id`, ({ params }) => {
    const { id } = params;

    const searchIndex = mockSearchHistory.findIndex(search => search.id === id);
    if (searchIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "검색 기록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const deletedSearch = mockSearchHistory.splice(searchIndex, 1)[0];

    return HttpResponse.json({
      success: true,
      data: deletedSearch
    });
  }),

  // 전체 검색 기록 삭제
  http.delete(`${API_BASE_URL}/v1/search/recent`, () => {
    mockSearchHistory = [];
    
    return HttpResponse.json({
      success: true,
      message: "모든 검색 기록이 삭제되었습니다."
    });
  })
];

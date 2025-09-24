import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'https://j13a305.p.ssafy.io/api';

// 경로 북마크 목록 (메모리 기반)
let mockRouteBookmarks = [
  {
    id: "1",
    name: "집에서 회사",
    startPlace: "강남역",
    endPlace: "서초역",
    totalTime: 25,
    totalDistance: 5000,
    transferCount: 0,
    fare: 1250,
    createdAt: "2024-01-15T09:00:00Z"
  },
  {
    id: "2",
    name: "회사에서 홍대",
    startPlace: "서초역",
    endPlace: "홍대입구역",
    totalTime: 35,
    totalDistance: 8000,
    transferCount: 1,
    fare: 1350,
    createdAt: "2024-01-16T18:30:00Z"
  }
];

// 경로 북마크 관련 핸들러
export const bookmarkHandlers = [
  // 경로 북마크 목록 조회
  http.get(`${API_BASE_URL}/v1/bookmarks/routes`, () => {
    return HttpResponse.json({
      success: true,
      data: mockRouteBookmarks
    });
  }),

  // 경로 북마크 추가
  http.post(`${API_BASE_URL}/v1/bookmarks/routes`, async ({ request }) => {
    const body = await request.json() as any;
    
    const newBookmark = {
      id: (mockRouteBookmarks.length + 1).toString(),
      name: body.name,
      startPlace: body.startPlace,
      endPlace: body.endPlace,
      totalTime: body.totalTime,
      totalDistance: body.totalDistance,
      transferCount: body.transferCount,
      fare: body.fare,
      createdAt: new Date().toISOString()
    };

    mockRouteBookmarks.push(newBookmark);

    return HttpResponse.json({
      success: true,
      data: newBookmark
    });
  }),

  // 경로 북마크 수정
  http.put(`${API_BASE_URL}/v1/bookmarks/routes/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;

    const bookmarkIndex = mockRouteBookmarks.findIndex(bookmark => bookmark.id === id);
    if (bookmarkIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "경로 북마크를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    mockRouteBookmarks[bookmarkIndex] = {
      ...mockRouteBookmarks[bookmarkIndex],
      name: body.name || mockRouteBookmarks[bookmarkIndex].name
    };

    return HttpResponse.json({
      success: true,
      data: mockRouteBookmarks[bookmarkIndex]
    });
  }),

  // 경로 북마크 삭제
  http.delete(`${API_BASE_URL}/v1/bookmarks/routes/:id`, ({ params }) => {
    const { id } = params;

    const bookmarkIndex = mockRouteBookmarks.findIndex(bookmark => bookmark.id === id);
    if (bookmarkIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "경로 북마크를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const deletedBookmark = mockRouteBookmarks.splice(bookmarkIndex, 1)[0];

    return HttpResponse.json({
      success: true,
      data: deletedBookmark
    });
  })
];

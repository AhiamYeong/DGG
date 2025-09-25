import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'https://j13a305.p.ssafy.io/api';

// 경로 북마크 목록 (메모리 기반)
let mockRouteBookmarks = [
  {
    bookmarkRouteId: 1,
    name: "집에서 회사",
    departureName: "강남역",
    destinationName: "서초역",
    routeKey: "route_key_1",
    createdAt: "2024-01-15T09:00:00Z"
  },
  {
    bookmarkRouteId: 2,
    name: "회사에서 홍대",
    departureName: "서초역",
    destinationName: "홍대입구역",
    routeKey: "route_key_2",
    createdAt: "2024-01-16T18:30:00Z"
  },
  {
    bookmarkRouteId: 3,
    name: "강남에서 여의도",
    departureName: "강남역",
    destinationName: "여의도역",
    routeKey: "route_key_3",
    createdAt: "2024-01-17T12:00:00Z"
  }
];

// 경로 북마크 관련 핸들러
export const bookmarkHandlers = [
  // 경로 즐겨찾기 목록 조회
  http.get(`${API_BASE_URL}/v1/bookmarks/routes`, () => {
    return HttpResponse.json(mockRouteBookmarks);
  }),

  // 경로 즐겨찾기 추가 (검색 결과에서 - routeKey 사용)
  http.post(`${API_BASE_URL}/v1/bookmarks/routes`, async ({ request }) => {
    const body = await request.json() as any;
    
    // routeKey가 있는 경우 (검색 결과에서 즐겨찾기 추가)
    if (body.routeKey) {
      const newBookmark = {
        bookmarkRouteId: mockRouteBookmarks.length + 1,
        name: body.name,
        departureName: body.departureName,
        destinationName: body.destinationName,
        routeKey: body.routeKey,
        createdAt: new Date().toISOString()
      };

      mockRouteBookmarks.push(newBookmark);
      return HttpResponse.json(newBookmark);
    }
    
    // routeId가 있는 경우 (경로 안내 완료 후 즐겨찾기 추가)
    if (body.routeId) {
      const newBookmark = {
        bookmarkRouteId: mockRouteBookmarks.length + 1,
        name: body.name,
        departureName: body.departureName,
        destinationName: body.destinationName,
        routeKey: `route_key_${body.routeId}`, // routeId를 기반으로 routeKey 생성
        createdAt: new Date().toISOString()
      };

      mockRouteBookmarks.push(newBookmark);
      return HttpResponse.json(newBookmark);
    }

    return HttpResponse.json(
      { success: false, message: "routeKey 또는 routeId가 필요합니다." },
      { status: 400 }
    );
  }),

  // 경로 즐겨찾기 상세조회 (길안내 시작)
  http.get(`${API_BASE_URL}/v1/bookmarks/routes/:bookmarkRouteId`, ({ params }) => {
    const { bookmarkRouteId } = params;
    const bookmark = mockRouteBookmarks.find(b => b.bookmarkRouteId === parseInt(bookmarkRouteId as string));
    
    if (!bookmark) {
      return HttpResponse.json(
        { success: false, message: "즐겨찾기 경로를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 상세 경로 정보 반환 (실제로는 더 복잡한 데이터)
    return HttpResponse.json({
      success: true,
      data: {
        ...bookmark,
        steps: [
          {
            id: 1,
            type: "subway",
            description: `${bookmark.departureName} → ${bookmark.destinationName}`,
            duration: 25,
            lineInfo: {
              name: "2호선",
              direction: "강남방향",
              stationCount: 5
            }
          }
        ],
        totalDuration: 25,
        totalDistance: 5000,
        fatigueLevel: 30
      }
    });
  }),

  // 경로 즐겨찾기 이름 수정
  http.put(`${API_BASE_URL}/v1/bookmarks/routes/:bookmarkRouteId`, async ({ params, request }) => {
    const { bookmarkRouteId } = params;
    const body = await request.json() as any;

    const bookmarkIndex = mockRouteBookmarks.findIndex(bookmark => bookmark.bookmarkRouteId === parseInt(bookmarkRouteId as string));
    if (bookmarkIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "즐겨찾기 경로를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    mockRouteBookmarks[bookmarkIndex] = {
      ...mockRouteBookmarks[bookmarkIndex],
      name: body.name
    };

    return HttpResponse.json(mockRouteBookmarks[bookmarkIndex]);
  }),

  // 경로 즐겨찾기 삭제
  http.delete(`${API_BASE_URL}/v1/bookmarks/routes/:bookmarkRouteId`, ({ params }) => {
    const { bookmarkRouteId } = params;

    const bookmarkIndex = mockRouteBookmarks.findIndex(bookmark => bookmark.bookmarkRouteId === parseInt(bookmarkRouteId as string));
    if (bookmarkIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "즐겨찾기 경로를 찾을 수 없습니다." },
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

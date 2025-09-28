import { http, HttpResponse } from 'msw';
import 덜피곤한경로Data from '../stores/덜피곤한경로.json';

const API_BASE_URL = 'http://localhost:8080/api';

// 경로 북마크 목록 (메모리 기반) - 덜 피곤한 경로만 남김
let mockRouteBookmarks = [
  {
    bookmarkRouteId: 13,
    name: "덜 피곤한 경로",
    departureName: "병점",
    destinationName: "역삼",
    routeKey: "route_key_13",
    createdAt: "2024-01-15T09:00:00Z"
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

  // 경로 즐겨찾기 상세조회 (길안내 시작) - 실제 JSON 데이터 사용
  http.get(`${API_BASE_URL}/v1/bookmarks/routes/:bookmarkRouteId`, ({ params }) => {
    const { bookmarkRouteId } = params;
    const bookmark = mockRouteBookmarks.find(b => b.bookmarkRouteId === parseInt(bookmarkRouteId as string));
    
    if (!bookmark) {
      return HttpResponse.json(
        { success: false, message: "즐겨찾기 경로를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // ID가 13인 경우 실제 JSON 데이터 반환
    if (parseInt(bookmarkRouteId as string) === 13) {
      console.log("🎯 MSW: 실제 JSON 데이터 반환", {
        name: 덜피곤한경로Data.name,
        totalTime: 덜피곤한경로Data.totalTime,
        stepsCount: 덜피곤한경로Data.data.length
      });
      
      return HttpResponse.json({
        success: true,
        data: 덜피곤한경로Data
      });
    }

    // 다른 ID의 경우 기본 응답
    return HttpResponse.json({
      success: true,
      data: {
        bookmarkRouteId: bookmark.bookmarkRouteId,
        name: bookmark.name,
        totalTime: 0,
        arrivalTime: new Date().toISOString(),
        data: []
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

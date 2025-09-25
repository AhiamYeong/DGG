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
  },
  {
    bookmarkRouteId: 4,
    name: "이마트 가는길",
    departureName: "역삼역",
    destinationName: "이마트",
    routeKey: "route_key_4",
    createdAt: "2024-01-18T14:00:00Z"
  },
  {
    bookmarkRouteId: 5,
    name: "병원 가는길",
    departureName: "강남역",
    destinationName: "삼성서울병원",
    routeKey: "route_key_5",
    createdAt: "2024-01-19T10:00:00Z"
  },
  {
    bookmarkRouteId: 6,
    name: "공항 가는길",
    departureName: "강남역",
    destinationName: "인천공항",
    routeKey: "route_key_6",
    createdAt: "2024-01-20T06:00:00Z"
  },
  {
    bookmarkRouteId: 7,
    name: "학교 가는길",
    departureName: "역삼역",
    destinationName: "서울대학교",
    routeKey: "route_key_7",
    createdAt: "2024-01-21T08:00:00Z"
  },
  {
    bookmarkRouteId: 8,
    name: "쇼핑몰 가는길",
    departureName: "강남역",
    destinationName: "코엑스",
    routeKey: "route_key_8",
    createdAt: "2024-01-22T15:00:00Z"
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

    // 즐겨찾기 경로 상세 데이터 반환 (지하철/버스 노선)
    const bookmarkDetailData = {
      bookmarkRouteId: bookmark.bookmarkRouteId,
      name: bookmark.name,
      totalTime: 45,
      arrivalTime: "2025-09-24 23:17:22",
      data: [
        {
          order: 1,
          type: "WALKING",
          lineName: null,
          timeTaken: 5,
          startPoint: null,
          endPoint: null,
          startLat: null,
          startLng: null,
          endLat: null,
          endLng: null,
          path: [],
          etaMin: null
        },
        {
          order: 2,
          type: "SUBWAY",
          lineName: "수도권 2호선",
          timeTaken: 20,
          startPoint: "강남역",
          endPoint: "사당역",
          startLat: 37.497952,
          startLng: 127.027619,
          endLat: 37.476575,
          endLng: 126.981363,
          path: [
            {
              seq: 1,
              name: "강남역",
              stationId: "222",
              lat: 37.497952,
              lng: 127.027619
            },
            {
              seq: 2,
              name: "교대역",
              stationId: "223",
              lat: 37.493902,
              lng: 127.014395
            },
            {
              seq: 3,
              name: "서초역",
              stationId: "224",
              lat: 37.491852,
              lng: 127.007702
            },
            {
              seq: 4,
              name: "방배역",
              stationId: "225",
              lat: 37.481496,
              lng: 126.997667
            },
            {
              seq: 5,
              name: "사당역",
              stationId: "226",
              lat: 37.476575,
              lng: 126.981363
            }
          ],
          etaMin: null
        },
        {
          order: 3,
          type: "WALKING",
          lineName: null,
          timeTaken: 3,
          startPoint: null,
          endPoint: null,
          startLat: null,
          startLng: null,
          endLat: null,
          endLng: null,
          path: [],
          etaMin: null
        },
        {
          order: 4,
          type: "SUBWAY",
          lineName: "수도권 4호선",
          timeTaken: 15,
          startPoint: "사당역",
          endPoint: "삼각지역",
          startLat: 37.476575,
          startLng: 126.981363,
          endLat: 37.5347,
          endLng: 126.9737,
          path: [
            {
              seq: 1,
              name: "사당역",
              stationId: "433",
              lat: 37.476575,
              lng: 126.981363
            },
            {
              seq: 2,
              name: "남태령역",
              stationId: "434",
              lat: 37.464247,
              lng: 126.989114
            },
            {
              seq: 3,
              name: "선바위역",
              stationId: "435",
              lat: 37.451785,
              lng: 127.002108
            },
            {
              seq: 4,
              name: "경마공원역",
              stationId: "436",
              lat: 37.443959,
              lng: 127.007767
            },
            {
              seq: 5,
              name: "대공원역",
              stationId: "437",
              lat: 37.435724,
              lng: 127.006557
            },
            {
              seq: 6,
              name: "과천역",
              stationId: "438",
              lat: 37.432785,
              lng: 126.996542
            },
            {
              seq: 7,
              name: "정부과천청사역",
              stationId: "439",
              lat: 37.426502,
              lng: 126.989778
            },
            {
              seq: 8,
              name: "인덕원역",
              stationId: "440",
              lat: 37.401859,
              lng: 126.97711
            },
            {
              seq: 9,
              name: "평촌역",
              stationId: "441",
              lat: 37.394346,
              lng: 126.963898
            },
            {
              seq: 10,
              name: "범계역",
              stationId: "442",
              lat: 37.389794,
              lng: 126.950766
            },
            {
              seq: 11,
              name: "금정역",
              stationId: "443",
              lat: 37.372351,
              lng: 126.943512
            },
            {
              seq: 12,
              name: "삼각지역",
              stationId: "444",
              lat: 37.5347,
              lng: 126.9737
            }
          ],
          etaMin: null
        },
        {
          order: 5,
          type: "WALKING",
          lineName: null,
          timeTaken: 2,
          startPoint: null,
          endPoint: null,
          startLat: null,
          startLng: null,
          endLat: null,
          endLng: null,
          path: [],
          etaMin: null
        }
      ]
    };

    return HttpResponse.json({
      success: true,
      data: bookmarkDetailData
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

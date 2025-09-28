import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api';

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

    // 즐겨찾기 경로 상세 데이터 반환 (사용자가 제공한 형식)
    const bookmarkDetailData = {
      bookmarkRouteId: bookmark.bookmarkRouteId,
      name: bookmark.name,
      totalTime: 92,
      arrivalTime: "2025-09-24 23:17:22",
      data: [
        {
          order: 1,
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
          order: 2,
          type: "BUS",
          lineName: "463",
          timeTaken: 28,
          startPoint: "역삼역7번출구.GS타워",
          endPoint: "현대아파트",
          startLat: 37.501584,
          startLng: 127.036811,
          endLat: 37.528325,
          endLng: 127.031105,
          path: [
            {
              seq: 1,
              name: "역삼역7번출구.GS타워",
              stationId: "106619",
              lat: 37.501584,
              lng: 127.036811
            },
            {
              seq: 2,
              name: "차병원",
              stationId: "106516",
              lat: 37.506628,
              lng: 127.034394
            },
            {
              seq: 3,
              name: "언주역3번출구",
              stationId: "111685",
              lat: 37.508567,
              lng: 127.033487
            },
            {
              seq: 4,
              name: "논현고개",
              stationId: "106439",
              lat: 37.511376,
              lng: 127.032161
            },
            {
              seq: 5,
              name: "학동역",
              stationId: "106356",
              lat: 37.515084,
              lng: 127.030473
            },
            {
              seq: 6,
              name: "강남을지병원",
              stationId: "106297",
              lat: 37.518593,
              lng: 127.028799
            },
            {
              seq: 7,
              name: "국민은행압구정종합금융센터",
              stationId: "106283",
              lat: 37.523448,
              lng: 127.02851
            },
            {
              seq: 8,
              name: "압구정역3번출구",
              stationId: "106294",
              lat: 37.526062,
              lng: 127.028691
            },
            {
              seq: 9,
              name: "현대아파트",
              stationId: "106377",
              lat: 37.528325,
              lng: 127.031105
            }
          ],
          etaMin: 13
        },
        {
          order: 3,
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
          order: 4,
          type: "BUS",
          lineName: "141",
          timeTaken: 40,
          startPoint: "성수대교남단.현대아파트",
          endPoint: "홍파초등학교",
          startLat: 37.529846,
          startLng: 127.034118,
          endLat: 37.585604,
          endLng: 127.038675,
          path: [
            {
              seq: 1,
              name: "성수대교남단.현대아파트",
              stationId: "106490",
              lat: 37.529846,
              lng: 127.034118
            },
            {
              seq: 2,
              name: "뚝섬서울숲",
              stationId: "151511",
              lat: 37.544562,
              lng: 127.036588
            },
            {
              seq: 3,
              name: "응봉사거리",
              stationId: "106502",
              lat: 37.555339,
              lng: 127.03448
            },
            {
              seq: 4,
              name: "무학여고앞",
              stationId: "106494",
              lat: 37.557878,
              lng: 127.034221
            },
            {
              seq: 5,
              name: "성동구청",
              stationId: "194264",
              lat: 37.564114,
              lng: 127.036427
            },
            {
              seq: 6,
              name: "도선사거리",
              stationId: "106620",
              lat: 37.566766,
              lng: 127.036868
            },
            {
              seq: 7,
              name: "마장축산물시장",
              stationId: "106671",
              lat: 37.570984,
              lng: 127.038048
            },
            {
              seq: 8,
              name: "동대문구청.용신동주민센터",
              stationId: "106698",
              lat: 37.576609,
              lng: 127.038406
            },
            {
              seq: 9,
              name: "경동시장앞",
              stationId: "193671",
              lat: 37.580549,
              lng: 127.03865
            },
            {
              seq: 10,
              name: "홍파초등학교",
              stationId: "106707",
              lat: 37.585604,
              lng: 127.038675
            }
          ],
          etaMin: 18
        },
        {
          order: 5,
          type: "WALKING",
          lineName: null,
          timeTaken: 6,
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
          order: 6,
          type: "BUS",
          lineName: "동대문05",
          timeTaken: 6,
          startPoint: "영휘원사거리.(구)홍릉사거리",
          endPoint: "청랑리한신아파트.청량사입구",
          startLat: 37.586012,
          startLng: 127.043471,
          endLat: 37.586487,
          endLng: 127.047552,
          path: [
            {
              seq: 1,
              name: "영휘원사거리.(구)홍릉사거리",
              stationId: "106933",
              lat: 37.586012,
              lng: 127.043471
            },
            {
              seq: 2,
              name: "동부아파트",
              stationId: "107039",
              lat: 37.586702,
              lng: 127.045228
            },
            {
              seq: 3,
              name: "청랑리한신아파트.청량사입구",
              stationId: "183841",
              lat: 37.586487,
              lng: 127.047552
            }
          ],
          etaMin: null
        },
        {
          order: 7,
          type: "WALKING",
          lineName: null,
          timeTaken: 4,
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
    console.log('[MSW] DELETE 요청 받음', { bookmarkRouteId, currentBookmarks: mockRouteBookmarks.length });

    const bookmarkIndex = mockRouteBookmarks.findIndex(bookmark => bookmark.bookmarkRouteId === parseInt(bookmarkRouteId as string));
    console.log('[MSW] 찾은 bookmarkIndex:', bookmarkIndex);
    
    if (bookmarkIndex === -1) {
      console.log('[MSW] 북마크를 찾을 수 없음');
      return HttpResponse.json(
        { success: false, message: "즐겨찾기 경로를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const deletedBookmark = mockRouteBookmarks.splice(bookmarkIndex, 1)[0];
    console.log('[MSW] 삭제된 북마크:', deletedBookmark);
    console.log('[MSW] 삭제 후 남은 북마크 수:', mockRouteBookmarks.length);

    return HttpResponse.json({
      success: true,
      data: deletedBookmark
    });
  })
];

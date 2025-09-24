import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'https://j13a305.p.ssafy.io/api';

// 경로 검색 관련 핸들러
export const routeHandlers = [
  // 헬스 체크
  http.get(`${API_BASE_URL}/health`, () => {
    console.log('🎯 MSW: 헬스 체크 API 인터셉트됨');
    return HttpResponse.json({ status: 'OK', timestamp: new Date().toISOString() });
  }),

  // 경로 검색 API
  http.post(`${API_BASE_URL}/v1/maps/routes`, async ({ request }) => {
    console.log('🎯 MSW: 경로 검색 API 인터셉트됨');
    const body = await request.json() as any;
    console.log('경로 검색 요청:', body);

    // 새로운 백엔드 API 형식에 맞는 응답
    const mockApiResponse = {
      departureAddress: "서울특별시 강남구 강남대로 396", // 도로명 주소 (API 응답 형식)
      destinationAddress: "서울특별시 마포구 마포대로 100", // 도로명 주소 (API 응답 형식)
      stopoverAddresses: body.waypoints && body.waypoints.length > 0 ? body.waypoints.slice(0, 2) : [],
      departureTime: body.departureTime || "2025-12-12 18:00:00",
      destinationTime: "2025-12-12 18:50:00", // 50분 후
      recommendedRoutes: [
        {
          routeKey: "mock-route-key-1",
          name: "최소 피로도",
          timeTaken: 48,
          arrivalTime: "2025-12-12 18:46:00",
          fatigue: 40
        },
        {
          routeKey: "mock-route-key-2",
          name: "최소 시간",
          timeTaken: 38,
          arrivalTime: "2025-12-12 18:36:00",
          fatigue: 90
        },
        {
          routeKey: "mock-route-key-3",
          name: "최소 환승",
          timeTaken: 45,
          arrivalTime: "2025-12-12 18:43:00",
          fatigue: 60
        }
      ]
    };

    return HttpResponse.json(mockApiResponse);
  }),

  // 경로 상세 정보 조회
  http.get(`${API_BASE_URL}/v1/maps/routes/:routeKey`, ({ params }) => {
    const { routeKey } = params;
    const mockRouteDetail = {
      routeKey,
      name: "상세 경로 정보",
      totalDistance: 8500,
      totalDuration: 48,
      polyline: {
        result: {
          lane: [
            {
              class: 2,
              type: 116, // 도보
              section: [
                {
                  graphPos: [
                    { x: 127.027618, y: 37.56151 },
                    { x: 127.027800, y: 37.56120 },
                    { x: 127.028000, y: 37.56090 }
                  ]
                }
              ]
            },
            {
              class: 2,
              type: 2, // 지하철
              name: "2호선",
              section: [
                {
                  graphPos: [
                    { x: 127.028000, y: 37.56090 },
                    { x: 127.030000, y: 37.55800 },
                    { x: 127.032000, y: 37.55500 }
                  ]
                }
              ]
            },
            {
              class: 2,
              type: 2, // 지하철
              name: "분당선",
              section: [
                {
                  graphPos: [
                    { x: 127.032000, y: 37.55500 },
                    { x: 127.034000, y: 37.55200 },
                    { x: 127.036000, y: 37.54900 }
                  ]
                }
              ]
            },
            {
              class: 2,
              type: 116, // 도보
              section: [
                {
                  graphPos: [
                    { x: 127.036000, y: 37.54900 },
                    { x: 127.036500, y: 37.54850 },
                    { x: 127.037000, y: 37.54800 }
                  ]
                }
              ]
            }
          ],
          boundary: {
            top: 37.56151,
            left: 127.027618,
            bottom: 37.497949,
            right: 127.049282
          }
        }
      },
      steps: [
        { type: "walk", description: "출발지에서 지하철역까지", duration: 3, distance: 200, polyline: { coordinates: [] } },
        { type: "subway", description: "2호선 이용", duration: 25, distance: 0, lineName: "2호선", direction: "강남방면", polyline: { coordinates: [] } },
        { type: "transfer", description: "환승", duration: 2, distance: 0 },
        { type: "subway", description: "3호선 이용", duration: 10, distance: 0, lineName: "3호선", direction: "수서방면", polyline: { coordinates: [] } },
        { type: "walk", description: "도착지까지", duration: 5, distance: 300, polyline: { coordinates: [] } }
      ]
    };
    return HttpResponse.json(mockRouteDetail);
  }),

  // 경로 안내 시작
  http.post(`${API_BASE_URL}/v1/maps/routes/:routeKey/start`, ({ params }) => {
    const { routeKey } = params;
    return HttpResponse.json({
      success: true,
      data: {
        routeKey,
        status: "started",
        message: "경로 안내가 시작되었습니다."
      }
    });
  })
];

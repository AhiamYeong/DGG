import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api';

// 경로 검색 관련 핸들러
export const routeHandlers = [

  // 경로 검색 API
  http.post(`${API_BASE_URL}/v1/maps/routes`, async ({ request }) => {
    const body = await request.json() as any;

    // 실제 백엔드 API 형식에 맞는 응답
    const mockApiResponse = {
      departureAddress: "병점노을1로 14",
      destinationAddress: "테헤란로 156",
      stopoverAddresses: [],
      departureTime: "2025-12-12 17:58:00",
      destinationTime: "2025-12-12 19:07:00",
      recommendedRoutes: [
        {
          routeKey: "c271385d8cbd80233b65025c",
          name: "최소 피로도",
          timeTaken: 71,
          arrivalTime: "2025-12-12 19:09:00",
          fatigue: 60
        },
        {
          routeKey: "7018a2e1323db5222185dda0",
          name: "최단 경로",
          timeTaken: 69,
          arrivalTime: "2025-12-12 19:07:00",
          fatigue: 66
        },
        {
          routeKey: "535c39375071cee1daeecb85",
          name: "최소 환승",
          timeTaken: 90,
          arrivalTime: "2025-12-12 19:28:00",
          fatigue: 65
        }
      ]
    };

    return HttpResponse.json(mockApiResponse);
  }),

  // 경로 상세 정보 조회
  http.get(`${API_BASE_URL}/v1/maps/routes/:routeId`, ({ params }) => {
    const { routeId } = params;
    // 백엔드: RouteDetailDTO 반환
    const mockRouteDetail = {
      totalTime: 48, // int totalTime
      departureTime: "2025-12-12 18:00:00", // String departureTime
      arrivalTime: "2025-12-12 18:48:00", // String arrivalTime
      fatigue: 40, // int fatigue
      // JSON 형식에 맞는 polyline 데이터 (각 step에 polyline 배열 추가)
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
          etaMin: null,
          polyline: []
        },
        {
          order: 2,
          type: "SUBWAY",
          lineName: "분당선",
          timeTaken: 25,
          startPoint: "출발지",
          endPoint: "환승역",
          startLat: 37.56151,
          startLng: 127.038713,
          endLat: 37.504586,
          endLng: 127.049282,
          path: [
            { lat: 37.56151, lng: 127.038713 },
            { lat: 37.504586, lng: 127.049282 }
          ],
          etaMin: null,
          polyline: [
            { lat: 37.56151, lng: 127.038713 }, { lat: 37.560916, lng: 127.038822 }, { lat: 37.560206, lng: 127.038956 },
            { lat: 37.559693, lng: 127.039053 }, { lat: 37.559135, lng: 127.039162 }, { lat: 37.558658, lng: 127.039259 },
            { lat: 37.558154, lng: 127.039344 }, { lat: 37.557705, lng: 127.039429 }, { lat: 37.557246, lng: 127.039514 },
            { lat: 37.556319, lng: 127.039685 }, { lat: 37.555824, lng: 127.039759 }, { lat: 37.555437, lng: 127.039832 },
            { lat: 37.555275, lng: 127.039868 }, { lat: 37.555158, lng: 127.039881 }, { lat: 37.555023, lng: 127.039905 },
            { lat: 37.554825, lng: 127.039942 }, { lat: 37.554664, lng: 127.039989 }, { lat: 37.554592, lng: 127.040013 },
            { lat: 37.554529, lng: 127.040036 }, { lat: 37.554403, lng: 127.040094 }, { lat: 37.554286, lng: 127.040152 },
            { lat: 37.553999, lng: 127.040314 }, { lat: 37.553793, lng: 127.040464 }, { lat: 37.553695, lng: 127.040567 },
            { lat: 37.553588, lng: 127.04067 }, { lat: 37.553463, lng: 127.040819 }, { lat: 37.553356, lng: 127.040945 },
            { lat: 37.553142, lng: 127.041265 }, { lat: 37.552902, lng: 127.041675 }, { lat: 37.552671, lng: 127.042086 },
            { lat: 37.552582, lng: 127.042245 }, { lat: 37.552485, lng: 127.042405 }, { lat: 37.552244, lng: 127.042804 },
            { lat: 37.552067, lng: 127.043089 }, { lat: 37.551897, lng: 127.043306 }, { lat: 37.551808, lng: 127.043409 },
            { lat: 37.551772, lng: 127.043455 }, { lat: 37.551718, lng: 127.04349 }, { lat: 37.551557, lng: 127.043628 },
            { lat: 37.551333, lng: 127.043766 }, { lat: 37.551199, lng: 127.043836 }, { lat: 37.5511, lng: 127.043882 },
            { lat: 37.551037, lng: 127.043917 }, { lat: 37.550866, lng: 127.043965 }, { lat: 37.550516, lng: 127.044071 },
            { lat: 37.549706, lng: 127.044217 }, { lat: 37.54913, lng: 127.044315 }, { lat: 37.548941, lng: 127.044351 },
            { lat: 37.548806, lng: 127.044376 }, { lat: 37.546736, lng: 127.04464 }, { lat: 37.545863, lng: 127.044741 },
            { lat: 37.544972, lng: 127.044855 }, { lat: 37.544648, lng: 127.044893 }, { lat: 37.544539, lng: 127.044894 },
            { lat: 37.544485, lng: 127.044895 }, { lat: 37.544305, lng: 127.044863 }, { lat: 37.54398, lng: 127.044777 },
            { lat: 37.543655, lng: 127.04469 }, { lat: 37.543212, lng: 127.044572 }, { lat: 37.54277, lng: 127.044453 },
            { lat: 37.540657, lng: 127.043959 }, { lat: 37.540233, lng: 127.043851 }, { lat: 37.539773, lng: 127.043744 },
            { lat: 37.539384, lng: 127.043658 }, { lat: 37.53794, lng: 127.043349 }, { lat: 37.537002, lng: 127.043146 },
            { lat: 37.536117, lng: 127.042942 }, { lat: 37.534275, lng: 127.042502 }, { lat: 37.532452, lng: 127.042084 },
            { lat: 37.530691, lng: 127.041654 }, { lat: 37.530185, lng: 127.041524 }, { lat: 37.529065, lng: 127.041154 },
            { lat: 37.528261, lng: 127.040859 }, { lat: 37.527827, lng: 127.040717 }, { lat: 37.527393, lng: 127.040576 },
            { lat: 37.526951, lng: 127.040412 }, { lat: 37.526517, lng: 127.040247 }, { lat: 37.525676, lng: 127.039953 },
            { lat: 37.524059, lng: 127.039363 }, { lat: 37.523707, lng: 127.039277 }, { lat: 37.523319, lng: 127.039236 },
            { lat: 37.522931, lng: 127.03923 }, { lat: 37.522625, lng: 127.039268 }, { lat: 37.522481, lng: 127.039304 },
            { lat: 37.52232, lng: 127.039351 }, { lat: 37.52223, lng: 127.039363 }, { lat: 37.521736, lng: 127.039551 },
            { lat: 37.521187, lng: 127.039739 }, { lat: 37.520514, lng: 127.040007 }, { lat: 37.519454, lng: 127.040406 },
            { lat: 37.518582, lng: 127.040734 }, { lat: 37.517729, lng: 127.041073 }, { lat: 37.517469, lng: 127.041189 },
            { lat: 37.517208, lng: 127.041271 }, { lat: 37.517029, lng: 127.04133 }, { lat: 37.516849, lng: 127.041401 },
            { lat: 37.516427, lng: 127.041553 }, { lat: 37.516004, lng: 127.041717 }, { lat: 37.51384, lng: 127.042536 },
            { lat: 37.512357, lng: 127.043087 }, { lat: 37.511531, lng: 127.043403 }, { lat: 37.511225, lng: 127.04352 },
            { lat: 37.510929, lng: 127.043637 }, { lat: 37.510372, lng: 127.043847 }, { lat: 37.510246, lng: 127.043883 },
            { lat: 37.509878, lng: 127.044023 }, { lat: 37.509806, lng: 127.044058 }, { lat: 37.50951, lng: 127.044186 },
            { lat: 37.509456, lng: 127.044221 }, { lat: 37.509241, lng: 127.044348 }, { lat: 37.509214, lng: 127.044371 },
            { lat: 37.509035, lng: 127.044498 }, { lat: 37.508936, lng: 127.044578 }, { lat: 37.508793, lng: 127.044704 },
            { lat: 37.508677, lng: 127.044808 }, { lat: 37.508534, lng: 127.044957 }, { lat: 37.508427, lng: 127.045082 },
            { lat: 37.50832, lng: 127.045219 }, { lat: 37.508284, lng: 127.045265 }, { lat: 37.508159, lng: 127.045436 },
            { lat: 37.507955, lng: 127.045744 }, { lat: 37.507732, lng: 127.046064 }, { lat: 37.507402, lng: 127.046543 },
            { lat: 37.507224, lng: 127.046817 }, { lat: 37.506975, lng: 127.047193 }, { lat: 37.506707, lng: 127.047536 },
            { lat: 37.506672, lng: 127.04757 }, { lat: 37.506466, lng: 127.047788 }, { lat: 37.506413, lng: 127.047845 },
            { lat: 37.506144, lng: 127.048086 }, { lat: 37.506073, lng: 127.048143 }, { lat: 37.505929, lng: 127.048236 },
            { lat: 37.505822, lng: 127.048316 }, { lat: 37.50557, lng: 127.048444 }, { lat: 37.505274, lng: 127.048606 },
            { lat: 37.504586, lng: 127.049282 }
          ]
        },
        {
          order: 3,
          type: "WALKING",
          lineName: null,
          timeTaken: 3,
          startPoint: "환승역",
          endPoint: "도착지",
          startLat: 37.504586,
          startLng: 127.049282,
          endLat: 37.497949,
          endLng: 127.027618,
          path: [],
          etaMin: null,
          polyline: []
        },
        {
          order: 4,
          type: "SUBWAY",
          lineName: "2호선",
          timeTaken: 20,
          startPoint: "환승역",
          endPoint: "도착지",
          startLat: 37.504586,
          startLng: 127.049282,
          endLat: 37.497949,
          endLng: 127.027618,
          path: [
            { lat: 37.504586, lng: 127.049282 },
            { lat: 37.497949, lng: 127.027618 }
          ],
          etaMin: null,
          polyline: [
            { lat: 37.504586, lng: 127.049282 }, { lat: 37.50417, lng: 127.047953 }, { lat: 37.503522, lng: 127.045778 },
            { lat: 37.503003, lng: 127.044077 }, { lat: 37.502494, lng: 127.042409 }, { lat: 37.502179, lng: 127.041373 },
            { lat: 37.501726, lng: 127.039908 }, { lat: 37.501217, lng: 127.038252 }, { lat: 37.500976, lng: 127.037475 },
            { lat: 37.500643, lng: 127.036371 }, { lat: 37.500328, lng: 127.035357 }, { lat: 37.500106, lng: 127.034648 },
            { lat: 37.499486, lng: 127.032631 }, { lat: 37.499088, lng: 127.031324 }, { lat: 37.498311, lng: 127.028801 },
            { lat: 37.497949, lng: 127.027618 }
          ]
        }
      ]
    };
    return HttpResponse.json(mockRouteDetail);
  }),

  // 경로 안내 시작
  http.post(`${API_BASE_URL}/v1/maps/routes/:routeKey/start`, ({ params }) => {
    const { routeKey } = params;
    // 백엔드: ResponseEntity<Long> 반환 (routeId)
    return HttpResponse.json(12345); // Long 타입의 routeId 반환
  })
];
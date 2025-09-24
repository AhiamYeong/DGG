import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'https://j13a305.p.ssafy.io/api';

// 즐겨찾기 장소 목록 (메모리 기반)
let mockFavoritePlaces = [
  {
    id: "1",
    title: "집",
    address: "서울특별시 강남구 역삼동 123-45",
    roadAddress: "서울특별시 강남구 테헤란로 123",
    latitude: 37.5665,
    longitude: 126.9780,
    createdAt: "2024-01-15T09:00:00Z"
  },
  {
    id: "2",
    title: "회사",
    address: "서울특별시 서초구 서초동 456-78",
    roadAddress: "서울특별시 서초구 강남대로 456",
    latitude: 37.5015,
    longitude: 127.0397,
    createdAt: "2024-01-16T10:30:00Z"
  },
  {
    id: "3",
    title: "카페",
    address: "서울특별시 마포구 홍대입구역",
    roadAddress: "서울특별시 마포구 양화로 188",
    latitude: 37.5563,
    longitude: 126.9226,
    createdAt: "2024-01-17T14:20:00Z"
  }
];

// 즐겨찾기 장소 관련 핸들러
export const favoritePlacesHandlers = [
  // 즐겨찾기 장소 목록 조회
  http.get(`${API_BASE_URL}/v1/bookmarks/places`, () => {
    return HttpResponse.json({
      success: true,
      data: mockFavoritePlaces
    });
  }),

  // 즐겨찾기 장소 추가
  http.post(`${API_BASE_URL}/v1/bookmarks/places`, async ({ request }) => {
    const body = await request.json() as any;
    
    const newPlace = {
      id: (mockFavoritePlaces.length + 1).toString(),
      title: body.title,
      address: body.address,
      roadAddress: body.roadAddress,
      latitude: body.latitude,
      longitude: body.longitude,
      createdAt: new Date().toISOString()
    };

    mockFavoritePlaces.push(newPlace);

    return HttpResponse.json({
      success: true,
      data: newPlace
    });
  }),

  // 즐겨찾기 장소 수정
  http.put(`${API_BASE_URL}/v1/bookmarks/places/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;

    const placeIndex = mockFavoritePlaces.findIndex(place => place.id === id);
    if (placeIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "즐겨찾기 장소를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    mockFavoritePlaces[placeIndex] = {
      ...mockFavoritePlaces[placeIndex],
      title: body.title || mockFavoritePlaces[placeIndex].title,
      address: body.address || mockFavoritePlaces[placeIndex].address,
      roadAddress: body.roadAddress || mockFavoritePlaces[placeIndex].roadAddress
    };

    return HttpResponse.json({
      success: true,
      data: mockFavoritePlaces[placeIndex]
    });
  }),

  // 즐겨찾기 장소 삭제
  http.delete(`${API_BASE_URL}/v1/bookmarks/places/:id`, ({ params }) => {
    const { id } = params;

    const placeIndex = mockFavoritePlaces.findIndex(place => place.id === id);
    if (placeIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "즐겨찾기 장소를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const deletedPlace = mockFavoritePlaces.splice(placeIndex, 1)[0];

    return HttpResponse.json({
      success: true,
      data: deletedPlace
    });
  })
];

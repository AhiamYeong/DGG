import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api';

// 장소 검색 관련 핸들러
export const placeSearchHandlers = [
  // 장소 검색 API
  http.get(`${API_BASE_URL}/v1/search/places`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const display = url.searchParams.get('display');
    const start = url.searchParams.get('start');

    console.log('장소 검색 요청:', { query, display, start });

    const mockSearchResults = [
      {
        title: "강남역",
        address: "서울특별시 강남구 역삼동 737",
        roadAddress: "서울특별시 강남구 강남대로 396"
      },
      {
        title: "강남역 2호선",
        address: "서울특별시 강남구 역삼동 737",
        roadAddress: "서울특별시 강남구 강남대로 396"
      },
      {
        title: "왕십리역",
        address: "서울특별시 성동구 행당동 188-1",
        roadAddress: "서울특별시 성동구 왕십리로 206"
      },
      {
        title: "왕십리역 2호선",
        address: "서울특별시 성동구 행당동 188-1",
        roadAddress: "서울특별시 성동구 왕십리로 206"
      },
      {
        title: "서울역",
        address: "서울특별시 중구 봉래동2가 122",
        roadAddress: "서울특별시 중구 한강대로 405"
      },
      {
        title: "홍대입구역",
        address: "서울특별시 마포구 동교동 165-1",
        roadAddress: "서울특별시 마포구 양화로 188"
      },
      {
        title: "명동",
        address: "서울특별시 중구 명동",
        roadAddress: "서울특별시 중구 명동"
      },
      {
        title: "이태원",
        address: "서울특별시 용산구 이태원동",
        roadAddress: "서울특별시 용산구 이태원로"
      }
    ];

    // 쿼리에 따른 필터링
    let filteredResults = mockSearchResults;
    if (query) {
      filteredResults = mockSearchResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.address.includes(query) ||
        item.roadAddress.includes(query)
      );
    }

    // 페이지네이션 처리
    const displayCount = parseInt(display || '10');
    const startIndex = parseInt(start || '1') - 1;
    const paginatedResults = filteredResults.slice(startIndex, startIndex + displayCount);

    return HttpResponse.json({
      success: true,
      data: {
        items: paginatedResults,
        total: filteredResults.length,
        display: displayCount,
        start: startIndex + 1
      }
    });
  })
];

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

    const mockSearchResults = [
      // 강남 관련
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
        title: "강남구청역",
        address: "서울특별시 강남구 역삼동 737",
        roadAddress: "서울특별시 강남구 선릉로 668"
      },
      {
        title: "강남구청",
        address: "서울특별시 강남구 역삼동 737",
        roadAddress: "서울특별시 강남구 선릉로 668"
      },
      
      // 왕십리 관련
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
        title: "왕십리역 5호선",
        address: "서울특별시 성동구 행당동 188-1",
        roadAddress: "서울특별시 성동구 왕십리로 206"
      },
      
      // 서울역 관련
      {
        title: "서울역",
        address: "서울특별시 중구 봉래동2가 122",
        roadAddress: "서울특별시 중구 한강대로 405"
      },
      {
        title: "서울역 1호선",
        address: "서울특별시 중구 봉래동2가 122",
        roadAddress: "서울특별시 중구 한강대로 405"
      },
      {
        title: "서울역 4호선",
        address: "서울특별시 중구 봉래동2가 122",
        roadAddress: "서울특별시 중구 한강대로 405"
      },
      
      // 홍대 관련
      {
        title: "홍대입구역",
        address: "서울특별시 마포구 동교동 165-1",
        roadAddress: "서울특별시 마포구 양화로 188"
      },
      {
        title: "홍대입구역 2호선",
        address: "서울특별시 마포구 동교동 165-1",
        roadAddress: "서울특별시 마포구 양화로 188"
      },
      {
        title: "홍대입구역 6호선",
        address: "서울특별시 마포구 동교동 165-1",
        roadAddress: "서울특별시 마포구 양화로 188"
      },
      
      // 명동 관련
      {
        title: "명동",
        address: "서울특별시 중구 명동",
        roadAddress: "서울특별시 중구 명동"
      },
      {
        title: "명동역",
        address: "서울특별시 중구 명동",
        roadAddress: "서울특별시 중구 명동"
      },
      {
        title: "명동성당",
        address: "서울특별시 중구 명동",
        roadAddress: "서울특별시 중구 명동"
      },
      
      // 이태원 관련
      {
        title: "이태원",
        address: "서울특별시 용산구 이태원동",
        roadAddress: "서울특별시 용산구 이태원로"
      },
      {
        title: "이태원역",
        address: "서울특별시 용산구 이태원동",
        roadAddress: "서울특별시 용산구 이태원로"
      },
      
      // 집 관련 (사용자가 "집"을 검색했으므로)
      {
        title: "집",
        address: "서울특별시 강남구 역삼동",
        roadAddress: "서울특별시 강남구 역삼동"
      },
      {
        title: "우리집",
        address: "서울특별시 강남구 역삼동",
        roadAddress: "서울특별시 강남구 역삼동"
      },
      {
        title: "집앞",
        address: "서울특별시 강남구 역삼동",
        roadAddress: "서울특별시 강남구 역삼동"
      },
      
      // 기타 인기 장소
      {
        title: "잠실역",
        address: "서울특별시 송파구 잠실동",
        roadAddress: "서울특별시 송파구 올림픽로 300"
      },
      {
        title: "건대입구역",
        address: "서울특별시 광진구 자양동",
        roadAddress: "서울특별시 광진구 능동로 110"
      },
      {
        title: "신촌역",
        address: "서울특별시 서대문구 신촌동",
        roadAddress: "서울특별시 서대문구 신촌로 90"
      },
      {
        title: "종각역",
        address: "서울특별시 종로구 종로1가",
        roadAddress: "서울특별시 종로구 종로 69"
      },
      {
        title: "을지로입구역",
        address: "서울특별시 중구 을지로1가",
        roadAddress: "서울특별시 중구 을지로 281"
      }
    ];

    // 쿼리에 따른 필터링 (더 정교한 검색)
    let filteredResults = mockSearchResults;
    if (query) {
      const searchQuery = query.toLowerCase().trim();
      filteredResults = mockSearchResults.filter(item => {
        const title = item.title.toLowerCase();
        const address = item.address.toLowerCase();
        const roadAddress = item.roadAddress.toLowerCase();
        
        // 정확한 일치 우선
        if (title === searchQuery) return true;
        
        // 부분 일치
        if (title.includes(searchQuery)) return true;
        if (address.includes(searchQuery)) return true;
        if (roadAddress.includes(searchQuery)) return true;
        
        // 한글 초성 검색 (간단한 버전)
        const initials: Record<string, string[]> = {
          'ㄱ': ['강남', '건대', '고속터미널'],
          'ㄴ': ['남산', '노원'],
          'ㄷ': ['대학로', '동대문'],
          'ㄹ': ['롯데월드'],
          'ㅁ': ['명동', '미아'],
          'ㅂ': ['부천', '분당'],
          'ㅅ': ['서울', '신촌', '송파', '성수'],
          'ㅇ': ['여의도', '용산', '이태원', '을지로'],
          'ㅈ': ['잠실', '종각', '중앙'],
          'ㅊ': ['천호', '청담'],
          'ㅋ': ['코엑스'],
          'ㅌ': ['태릉'],
          'ㅍ': ['파주'],
          'ㅎ': ['홍대', '회기']
        };
        
        // 초성으로 검색한 경우
        if (initials[searchQuery]) {
          return initials[searchQuery].some((initial: string) => 
            title.includes(initial) || address.includes(initial)
          );
        }
        
        return false;
      });
      
      // 검색 결과가 없으면 관련 키워드로 재검색
      if (filteredResults.length === 0) {
        const relatedKeywords: Record<string, string[]> = {
          '집': ['우리집', '집앞', '강남', '역삼'],
          '회사': ['강남', '서초', '여의도', '종각'],
          '학교': ['대학', '캠퍼스', '강남', '서초'],
          '병원': ['의료', '강남', '서울'],
          '공항': ['인천', '김포', '터미널'],
          '쇼핑': ['명동', '강남', '코엑스', '롯데'],
          '맛집': ['강남', '홍대', '명동', '이태원']
        };
        
        if (relatedKeywords[searchQuery]) {
          filteredResults = mockSearchResults.filter(item => 
            relatedKeywords[searchQuery].some((keyword: string) => 
              item.title.toLowerCase().includes(keyword.toLowerCase()) ||
              item.address.toLowerCase().includes(keyword.toLowerCase())
            )
          );
        }
      }
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

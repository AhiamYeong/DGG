import axios from 'axios';

// 네이버 지역 검색 API 응답 타입 정의
export interface NaverSearchItem {
  title: string;           // 업체, 기관의 이름
  link: string;            // 업체, 기관의 상세 정보 URL
  category: string;        // 업체, 기관의 분류 정보
  description: string;     // 업체, 기관에 대한 설명
  telephone: string;       // 전화번호 (현재는 빈 값)
  address: string;         // 지번 주소
  roadAddress: string;     // 도로명 주소
  mapx: number;           // x 좌표 (WGS84 좌표계)
  mapy: number;           // y 좌표 (WGS84 좌표계)
}

export interface NaverSearchResponse {
  lastBuildDate: string;   // 검색 결과 생성 시간
  total: number;          // 총 검색 결과 개수
  start: number;          // 검색 시작 위치
  display: number;        // 한 번에 표시할 검색 결과 개수
  items: NaverSearchItem[]; // 검색 결과 배열
}

// 검색 옵션 타입
export interface SearchOptions {
  display?: number;       // 표시할 결과 개수 (1-5, 기본값: 5)
  start?: number;         // 검색 시작 위치 (1-1000, 기본값: 1)
  sort?: 'random' | 'comment'; // 정렬 방법 (기본값: random)
}

// API 설정 (프록시 사용)
const API_BASE_URL = '/api/naver/v1/search';

// Axios 인스턴스 생성
const naverSearchApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 네이버 API 인증 헤더 추가
naverSearchApi.interceptors.request.use(
  (config) => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_NAVER_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('❌ 네이버 검색 API 클라이언트 ID 또는 시크릿이 설정되지 않았습니다.');
      console.error('❌ .env 파일에 VITE_NAVER_CLIENT_ID와 VITE_NAVER_CLIENT_SECRET을 설정해주세요.');
    }
    
    // 네이버 API 인증 헤더 추가
    config.headers['X-Naver-Client-Id'] = clientId;
    config.headers['X-Naver-Client-Secret'] = clientSecret;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 네이버 지역 검색 API 요청:', config);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ 네이버 API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
naverSearchApi.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 네이버 지역 검색 API 응답:', response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ 네이버 API 응답 에러:', error);
    
    // 에러 메시지 개선
    if (error.response?.status === 403) {
      throw new Error('네이버 API 권한이 없습니다. 클라이언트 ID와 시크릿을 확인해주세요.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다. 검색어를 확인해주세요.');
    } else if (error.response?.status === 429) {
      throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      throw new Error('검색 중 오류가 발생했습니다.');
    }
  }
);

/**
 * 네이버 지역 검색 API 호출
 * @param query 검색어
 * @param options 검색 옵션
 * @returns 검색 결과
 */
export const searchLocalPlaces = async (
  query: string,
  options: SearchOptions = {}
): Promise<NaverSearchResponse> => {
  try {
    // 검색어가 비어있으면 빈 결과 반환
    if (!query.trim()) {
      return {
        lastBuildDate: new Date().toISOString(),
        total: 0,
        start: 1,
        display: 0,
        items: []
      };
    }

    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_NAVER_CLIENT_SECRET;

    // API 키가 없으면 에러 반환
    if (!clientId || !clientSecret) {
      throw new Error('네이버 API 클라이언트 ID 또는 시크릿이 설정되지 않았습니다. .env 파일에 VITE_NAVER_CLIENT_ID와 VITE_NAVER_CLIENT_SECRET을 설정해주세요.');
    }

    // API 파라미터 설정 (네이버 API 문서 기준)
    const params = {
      query: query.trim(),
      display: Math.min(options.display || 5, 5), // 최대 5개 (문서 기준)
      start: Math.min(options.start || 1, 1000),  // 최대 1000 (문서 기준)
      sort: options.sort || 'random' // 'random' 또는 'comment'
    };

    // 네이버 지역 검색 API 호출
    const response = await naverSearchApi.get('/local.json', { params });
    
    // 응답 데이터 변환 (네이버 API JSON 응답 형식)
    const data = response.data;
    
    return {
      lastBuildDate: data.lastBuildDate,
      total: parseInt(data.total) || 0,
      start: parseInt(data.start) || 1,
      display: parseInt(data.display) || 0,
      items: data.items || []
    };
    
  } catch (error) {
    console.error('지역 검색 API 호출 실패:', error);
    throw error;
  }
};

/**
 * 검색 결과를 앱에서 사용하는 형식으로 변환
 * @param naverItems 네이버 API 검색 결과
 * @returns 앱에서 사용하는 검색 결과 형식
 */
export const convertNaverSearchResults = (naverItems: NaverSearchItem[]) => {
  return naverItems.map((item, index) => ({
    id: `naver_${index}_${Date.now()}`, // 고유 ID 생성
    name: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
    address: item.roadAddress || item.address,
    category: item.category,
    description: item.description.replace(/<[^>]*>/g, ''), // HTML 태그 제거
    distance: undefined, // 네이버 API에서는 거리 정보 제공 안함
    rating: undefined,   // 네이버 API에서는 평점 정보 제공 안함
    isFavorite: false,   // 기본값
    coordinates: {
      lat: item.mapy, // 네이버 좌표 그대로 사용 (네이버 Map API와 호환)
      lng: item.mapx
    },
    phone: item.telephone,
    link: item.link
  }));
};

/**
 * 네이버 지역 검색 API를 사용한 장소 검색 (앱 형식으로 변환)
 * @param query 검색어
 * @param options 검색 옵션
 * @returns 앱에서 사용하는 검색 결과 형식
 */
export const searchPlacesWithNaver = async (
  query: string,
  options: SearchOptions = {}
) => {
  try {
    const response = await searchLocalPlaces(query, options);
    const convertedResults = convertNaverSearchResults(response.items);
    
    return {
      success: true,
      data: convertedResults,
      total: response.total,
      message: `${response.total}개의 검색 결과를 찾았습니다.`
    };
  } catch (error) {
    console.error('네이버 지역 검색 실패:', error);
    return {
      success: false,
      data: [],
      total: 0,
      message: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.'
    };
  }
};


/**
 * 네이버 API 연결 테스트 함수
 * @returns API 연결 상태
 */
export const testNaverApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  hasCredentials: boolean;
}> => {
  const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_NAVER_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return {
      success: false,
      message: '네이버 API 클라이언트 ID 또는 시크릿이 설정되지 않았습니다. .env 파일에 VITE_NAVER_CLIENT_ID와 VITE_NAVER_CLIENT_SECRET을 설정해주세요.',
      hasCredentials: false
    };
  }

  try {
    // 간단한 테스트 검색 (갈비집)
    const response = await naverSearchApi.get('/local.json', {
      params: {
        query: '갈비집',
        display: 1,
        start: 1,
        sort: 'random'
      }
    });

    if (response.data && response.data.items) {
      return {
        success: true,
        message: `API 연결 성공! 총 ${response.data.total}개의 결과를 찾았습니다.`,
        hasCredentials: true
      };
    } else {
      return {
        success: false,
        message: 'API 응답 형식이 올바르지 않습니다.',
        hasCredentials: true
      };
    }
  } catch (error: any) {
    console.error('네이버 API 테스트 실패:', error);
    
    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'API 권한이 없습니다. 클라이언트 ID와 시크릿을 확인해주세요.',
        hasCredentials: true
      };
    } else if (error.response?.status === 400) {
      return {
        success: false,
        message: '잘못된 요청입니다. API 파라미터를 확인해주세요.',
        hasCredentials: true
      };
    } else {
      return {
        success: false,
        message: `API 연결 실패: ${error.message}`,
        hasCredentials: true
      };
    }
  }
};

export default naverSearchApi;

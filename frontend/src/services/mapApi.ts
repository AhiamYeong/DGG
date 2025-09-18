// 네이버 지도 API 및 서버 API 호출

// 네이버 지도 API 키
export const getNaverMapClientId = (): string => {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
  if (!clientId) {
    throw new Error('VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.');
  }
  return clientId;
};

// 네이버 지도 API 스크립트 로드
export const loadNaverMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.naver && window.naver.maps) {
      resolve();
      return;
    }

    // 스크립트 태그 생성
    const script = document.createElement('script');
    const clientId = getNaverMapClientId();
    console.log('API Key:', clientId); // 디버깅용
    
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    
    script.onload = () => {
      console.log('네이버 Map API 로드 완료');
      resolve();
    };
    
    script.onerror = () => {
      console.error('네이버 Map API 로드 실패');
      reject(new Error('네이버 Map API 로드에 실패했습니다.'));
    };
    
    document.head.appendChild(script);
  });
};

interface SearchPlaceResponse {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface RouteResponse {
  id: string;
  name: string;
  from: string;
  to: string;
  time: string;
  isBookmarked: boolean;
}

// 장소 검색 API
export const searchPlaces = async (query: string): Promise<SearchPlaceResponse[]> => {
  try {
    const response = await fetch(`/api/search/places?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('장소 검색에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('장소 검색 오류:', error);
    throw error;
  }
};

// 경로 검색 API
export const searchRoutes = async (
  origin: string,
  destination: string,
  waypoints?: string[]
): Promise<RouteResponse[]> => {
  try {
    const params = new URLSearchParams({
      origin,
      destination,
      ...(waypoints && waypoints.length > 0 && { waypoints: waypoints.join(',') })
    });
    
    const response = await fetch(`/api/routes/search?${params}`);
    if (!response.ok) {
      throw new Error('경로 검색에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('경로 검색 오류:', error);
    throw error;
  }
};

// 즐겨찾기 경로 목록 API
export const getFavoriteRoutes = async (): Promise<RouteResponse[]> => {
  try {
    const response = await fetch('/api/routes/favorites');
    if (!response.ok) {
      throw new Error('즐겨찾기 경로 조회에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('즐겨찾기 경로 조회 오류:', error);
    throw error;
  }
};

// 즐겨찾기 경로 추가 API
export const addFavoriteRoute = async (route: Omit<RouteResponse, 'id'>): Promise<RouteResponse> => {
  try {
    const response = await fetch('/api/routes/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(route),
    });
    
    if (!response.ok) {
      throw new Error('즐겨찾기 경로 추가에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('즐겨찾기 경로 추가 오류:', error);
    throw error;
  }
};

// 즐겨찾기 경로 삭제 API
export const removeFavoriteRoute = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/routes/favorites/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('즐겨찾기 경로 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('즐겨찾기 경로 삭제 오류:', error);
    throw error;
  }
};

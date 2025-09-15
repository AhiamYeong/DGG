// 서버 API 호출 전용 (네이버 지도 SDK는 NaverMap.tsx에서 직접 처리)

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

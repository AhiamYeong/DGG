// 검색 결과 타입 정의

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  roadAddress?: string;
  category: string;
  description: string;
  distance?: number;
  rating?: number;
  isFavorite?: boolean;
  location: {
    lat: number;
    lng: number;
  };
  phone?: string;
  link?: string;
  // 네이버 API 관련 필드
  title?: string;
  telephone?: string;
  mapx?: number;
  mapy?: number;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

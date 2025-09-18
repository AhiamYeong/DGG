import { Location, BaseEntity } from './common-types';

// 검색 관련 타입 정의

export type SearchType = 'address' | 'station' | 'landmark' | 'recent' | 'favorite';

export interface SearchHistory extends BaseEntity {
  query: string;
  location?: Location;
  timestamp: Date;
  type: 'recent' | 'favorite';
  searchType: SearchType;
  resultCount?: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: SearchType;
  location?: Location;
  description?: string;
  category?: string;
  distance?: number; // 미터 단위
  isFavorite?: boolean;
  icon?: string;
}

export interface SearchResult extends BaseEntity {
  name: string;
  address: string;
  roadAddress?: string; // 도로명 주소 (네이버 API)
  location: Location;
  type: SearchType;
  distance?: number; // 미터 단위
  isFavorite?: boolean;
  category?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: {
    open: string;
    close: string;
    isOpen: boolean;
  };
  contact?: {
    phone?: string;
    website?: string;
  };
  // 네이버 API 관련 필드
  title?: string; // HTML 태그가 포함된 제목
  link?: string; // 상세 정보 URL
  telephone?: string; // 전화번호
  mapx?: number; // x 좌표
  mapy?: number; // y 좌표
}


export interface SearchParams {
  query: string;
  location?: Location;
  radius?: number; // 미터 단위
  limit?: number;
  type?: SearchType[];
  category?: string[];
}

export interface SearchFilters {
  type?: SearchType[];
  category?: string[];
  distance?: {
    min: number;
    max: number;
  };
  rating?: {
    min: number;
    max: number;
  };
  isOpen?: boolean;
  hasParking?: boolean;
  wheelchairAccessible?: boolean;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  isLoading: boolean;
  error?: string;
  filters: SearchFilters;
  selectedLocation?: Location;
}
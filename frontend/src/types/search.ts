import { Location, BaseEntity } from './common';

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
}

// API 응답용 타입 (서비스 레이어에서 사용)
export interface ApiSearchResult {
  id: string;
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
  coordinates: {
    x: number;
    y: number;
  };
  createdAt: string;
  userId?: string;
}

// API 요청용 타입
export interface AddSearchResultRequest {
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
  coordinates: {
    x: number;
    y: number;
  };
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
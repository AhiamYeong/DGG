// 공통 타입 정의

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
}


export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 사용하지 않는 타입들 제거됨
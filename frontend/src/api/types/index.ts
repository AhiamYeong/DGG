// API 관련 타입 정의

// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  data: T
  message: string
  success: boolean
}

// 사용자 데이터 타입
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

// 인증 관련 타입
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// 웹뷰 메시지 타입
export interface WebViewMessage {
  type: string
  payload: any
}

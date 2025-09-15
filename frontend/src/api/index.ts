// API 모듈 exports

// 타입 exports
export * from './types'

// 상수 exports
export * from './constants'

// API 함수들
import { ChatRequest, ChatResponse, LoginRequest, LoginResponse, User } from './types'

const API_BASE_URL = 'http://localhost:3000/api'

// 채팅 메시지 전송
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 로그인
export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 사용자 프로필 조회
export const getUserProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 채팅 히스토리 조회
export const getChatHistory = async (sessionId: string): Promise<{ sessionId: string; messages: any[] }> => {
  const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 헬스 체크
export const healthCheck = async (): Promise<{ status: string; timestamp: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
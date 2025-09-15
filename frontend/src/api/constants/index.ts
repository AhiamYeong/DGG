// API 엔드포인트 정의

export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
  },
  
  // 사용자 관련
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },
  
  // 예시 엔드포인트들
  POSTS: '/posts',
  COMMENTS: '/comments',
} as const

// API 기본 URL
export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

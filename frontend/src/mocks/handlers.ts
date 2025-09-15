import { http, HttpResponse } from 'msw'
import { ChatRequest, ChatResponse, LoginRequest, LoginResponse, User } from '../api/types'

// 모의 사용자 데이터
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: '테스트 사용자',
  avatar: 'https://via.placeholder.com/150'
}

// 모의 채팅 세션 데이터
const chatSessions = new Map<string, string[]>()

export const handlers = [
  // 로그인 API
  http.post('http://localhost:3000/api/auth/login', async ({ request }) => {
    const body = await request.json() as LoginRequest
    
    // 간단한 인증 로직 (실제로는 더 복잡할 수 있음)
    if (body.email === 'test@example.com' && body.password === 'password') {
      const response: LoginResponse = {
        token: 'mock-jwt-token-12345',
        user: mockUser
      }
      return HttpResponse.json(response)
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // 사용자 정보 조회 API
  http.get('http://localhost:3000/api/user/profile', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json(mockUser)
  }),

  // 채팅 메시지 전송 API
  http.post('http://localhost:3000/api/chat', async ({ request }) => {
    const body = await request.json() as ChatRequest
    const { message, sessionId } = body
    
    // 세션별 채팅 기록 저장
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, [])
    }
    const sessionMessages = chatSessions.get(sessionId)!
    sessionMessages.push(message)
    
    // 간단한 AI 응답 시뮬레이션
    const responses = [
      '안녕하세요! 무엇을 도와드릴까요?',
      '흥미로운 질문이네요. 더 자세히 설명해주세요.',
      '그것에 대해 생각해보겠습니다.',
      '좋은 아이디어입니다!',
      '도움이 되었다니 기쁩니다.',
      '다른 질문이 있으시면 언제든 말씀해주세요.'
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    const response: ChatResponse = {
      response: randomResponse,
      sessionId: sessionId
    }
    
    // 실제 API처럼 약간의 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return HttpResponse.json(response)
  }),

  // 채팅 히스토리 조회 API
  http.get('http://localhost:3000/api/chat/history/:sessionId', ({ params }) => {
    const { sessionId } = params
    const messages = chatSessions.get(sessionId as string) || []
    
    return HttpResponse.json({
      sessionId,
      messages: messages.map((msg, index) => ({
        id: index + 1,
        text: msg,
        isUser: true,
        timestamp: new Date().toISOString()
      }))
    })
  }),

  // 헬스 체크 API
  http.get('http://localhost:3000/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'MSW Mock Server is running'
    })
  })
]

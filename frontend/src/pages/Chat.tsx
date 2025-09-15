import { useState, useRef, useEffect } from 'react'
import { sendChatMessage, ChatMessage } from '../api'

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: '안녕하세요! 무엇을 도와드릴까요?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage = inputValue
    setInputValue('') // 입력창 즉시 비우기

    // 사용자 메시지 즉시 추가
    const userMsg = { 
      id: Date.now(), 
      text: userMessage, 
      isUser: true,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])

    // 로딩 메시지 추가
    const loadingMsg = { 
      id: Date.now() + 1, 
      text: 'AI가 답변을 생성하고 있습니다...', 
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMsg])

    try {
      const data = await sendChatMessage({
        message: userMessage,
        sessionId: sessionId
      })
      
      // 로딩 메시지 제거하고 실제 응답 추가
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMsg.id)
        return [...withoutLoading, { 
          id: Date.now() + 2, 
          text: data.response, 
          isUser: false,
          timestamp: new Date(),
          isLoading: false
        }]
      })
      
    } catch (error) {
      console.error('채팅 전송 오류:', error)
      
      // 로딩 메시지 제거하고 에러 메시지 추가
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMsg.id)
        return [...withoutLoading, { 
          id: Date.now() + 2, 
          text: '죄송합니다. 메시지 전송에 실패했습니다. 다시 시도해주세요.', 
          isUser: false,
          timestamp: new Date(),
          isLoading: false
        }]
      })
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex flex-col">
      <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col">
        {/* 채팅 헤더 */}
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">AI 채팅</h1>
          <p className="text-sm text-gray-500">세션 ID: {sessionId}</p>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                } ${message.isLoading ? 'animate-pulse' : ''}`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={messages.some(msg => msg.isLoading)}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || messages.some(msg => msg.isLoading)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              전송
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat

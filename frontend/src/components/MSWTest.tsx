import React, { useState } from 'react'
import { sendChatMessage, login, getUserProfile, healthCheck } from '../api'

const MSWTest: React.FC = () => {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const testHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await healthCheck()
      setResult(`헬스 체크 성공: ${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      setResult(`헬스 체크 실패: ${error}`)
    }
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await login({
        email: 'test@example.com',
        password: 'password'
      })
      setResult(`로그인 성공: ${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      setResult(`로그인 실패: ${error}`)
    }
    setLoading(false)
  }

  const testChat = async () => {
    setLoading(true)
    try {
      const response = await sendChatMessage({
        message: '안녕하세요! MSW 테스트입니다.',
        sessionId: 'test-session-123'
      })
      setResult(`채팅 성공: ${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      setResult(`채팅 실패: ${error}`)
    }
    setLoading(false)
  }

  const testUserProfile = async () => {
    setLoading(true)
    try {
      const response = await getUserProfile('mock-jwt-token-12345')
      setResult(`사용자 프로필 조회 성공: ${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      setResult(`사용자 프로필 조회 실패: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">MSW 테스트</h2>
      <p className="mb-4 text-gray-600">
        MSW(Mock Service Worker)를 사용하여 백엔드 서버 없이 API를 테스트할 수 있습니다.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          헬스 체크
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          로그인 테스트
        </button>
        
        <button
          onClick={testChat}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          채팅 테스트
        </button>
        
        <button
          onClick={testUserProfile}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          프로필 조회
        </button>
      </div>

      {loading && (
        <div className="text-center mb-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">로딩 중...</span>
        </div>
      )}

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">결과:</h3>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">테스트 계정 정보:</h3>
        <ul className="text-sm text-yellow-700">
          <li>이메일: test@example.com</li>
          <li>비밀번호: password</li>
          <li>토큰: mock-jwt-token-12345</li>
        </ul>
      </div>
    </div>
  )
}

export default MSWTest



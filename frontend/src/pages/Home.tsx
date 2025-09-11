import { useState } from 'react'
import { useCounterStore } from '../store/counterStore'

const Home = () => {
  const { count, increment, decrement, reset } = useCounterStore()
  const [message, setMessage] = useState('웹뷰 앱에 오신 것을 환영합니다!')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {message}
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          React 19, TypeScript, Vite, Tailwind CSS로 구축된 웹뷰 프론트엔드입니다.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">카운터 예제</h2>
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          <button
            onClick={decrement}
            className="btn-mobile bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            -
          </button>
          <span className="text-2xl sm:text-3xl font-bold text-primary-600 min-w-[60px] text-center">
            {count}
          </span>
          <button
            onClick={increment}
            className="btn-mobile bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            +
          </button>
        </div>
        <div className="text-center mt-4">
          <button
            onClick={reset}
            className="btn-mobile bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            리셋
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">기술 스택</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• React 19.1.0</li>
            <li>• TypeScript 5.8.3</li>
            <li>• Vite 6.3.5</li>
            <li>• Tailwind CSS 3.4.17</li>
            <li>• Zustand 5.0.6</li>
            <li>• React Router DOM 7.7.1</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">주요 기능</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• 반응형 디자인</li>
            <li>• 상태 관리 (Zustand)</li>
            <li>• 라우팅 (React Router)</li>
            <li>• 타입 안전성 (TypeScript)</li>
            <li>• 빠른 개발 환경 (Vite)</li>
            <li>• 모던 CSS (Tailwind)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home

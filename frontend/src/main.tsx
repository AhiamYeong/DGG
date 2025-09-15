import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'

// MSW 초기화 (개발 환경에서만)
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return
  }

  // Service Worker 지원 확인
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker를 지원하지 않는 브라우저입니다.')
    return
  }

  try {
    const { worker } = await import('./mocks/browser')
    
    // MSW 워커 시작 - 네트워크 환경을 위한 설정
    return worker.start({
      onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 그대로 통과
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
      waitUntilReady: true,
    })
  } catch (error) {
    console.warn('MSW 초기화 실패:', error)
    // MSW 초기화가 실패해도 앱은 계속 실행
    return Promise.resolve()
  }
}

// MSW 초기화 후 앱 렌더링
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
})

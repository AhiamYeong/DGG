import { useEffect, useCallback } from 'react'
import { WebViewMessage, WebViewBridge } from '../api/types'

/**
 * 웹뷰 환경에서 네이티브 앱과의 통신을 위한 커스텀 훅
 */
export const useWebView = () => {
  // 웹뷰 브리지가 사용 가능한지 확인
  const isWebView = useCallback(() => {
    return !!(window as any).ReactNativeWebView || !!(window as any).webkit?.messageHandlers
  }, [])

  // 네이티브 앱으로 메시지 전송
  const postMessage = useCallback((message: WebViewMessage) => {
    if (isWebView()) {
      if ((window as any).ReactNativeWebView) {
        // React Native WebView
        ;(window as any).ReactNativeWebView.postMessage(JSON.stringify(message))
      } else if ((window as any).webkit?.messageHandlers?.nativeHandler) {
        // iOS WKWebView
        ;(window as any).webkit.messageHandlers.nativeHandler.postMessage(message)
      }
    } else {
      console.log('WebView 메시지 (개발 모드):', message)
    }
  }, [isWebView])

  // 네이티브 앱에서 메시지 수신
  const onMessage = useCallback((callback: (message: WebViewMessage) => void) => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        callback(message)
      } catch (error) {
        console.error('메시지 파싱 실패:', error)
      }
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // 웹뷰 환경 감지
  useEffect(() => {
    if (isWebView()) {
      console.log('WebView 환경에서 실행 중')
    } else {
      console.log('브라우저 환경에서 실행 중')
    }
  }, [isWebView])

  return {
    isWebView: isWebView(),
    postMessage,
    onMessage,
  }
}

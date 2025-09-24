/** @format */

import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./styles/index.css";

// Mocking Service Worker 추가
async function enableMocking() {
  if (process.env.NODE_ENV === "development") {
    console.log('🚀 MSW 시작 중...');
    try {
      const { worker } = await import("./mocks/browsers");
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      });
      console.log('✅ MSW가 성공적으로 시작되었습니다.');
    } catch (error) {
      console.error('❌ MSW 시작 실패:', error);
    }
  } else {
    console.log('🔧 프로덕션 환경 - MSW 비활성화');
  }
}

export default function App() {
  // 공식 문서 권장: 전역 제스처 이벤트 방지
  useEffect(() => {
    const preventGestureEvents = (e: Event) => e.preventDefault();

    // iOS Safari 제스처 이벤트 방지
    document.addEventListener("gesturestart", preventGestureEvents);
    document.addEventListener("gesturechange", preventGestureEvents);
    document.addEventListener("gestureend", preventGestureEvents);

    return () => {
      document.removeEventListener("gesturestart", preventGestureEvents);
      document.removeEventListener("gesturechange", preventGestureEvents);
      document.removeEventListener("gestureend", preventGestureEvents);
    };
  }, []);

  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
} //

// mocking 추가 -> 네트워크 연결 되면 해당 주석처리 후, 아래 주석 해제
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

// // DOM에 렌더링
// createRoot(document.getElementById("root")!).render(<App />);

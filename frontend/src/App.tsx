import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './styles/index.css';

export default function App() {
  // 공식 문서 권장: 전역 제스처 이벤트 방지
  useEffect(() => {
    const preventGestureEvents = (e: Event) => e.preventDefault();
    
    // iOS Safari 제스처 이벤트 방지
    document.addEventListener('gesturestart', preventGestureEvents);
    document.addEventListener('gesturechange', preventGestureEvents);
    document.addEventListener('gestureend', preventGestureEvents);
    
    return () => {
      document.removeEventListener('gesturestart', preventGestureEvents);
      document.removeEventListener('gesturechange', preventGestureEvents);
      document.removeEventListener('gestureend', preventGestureEvents);
    };
  }, []);

  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}

// DOM에 렌더링
createRoot(document.getElementById('root')!).render(<App />);
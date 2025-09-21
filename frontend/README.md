# WebView Frontend

React 19, TypeScript, Vite, Tailwind CSS로 구축된 웹뷰용 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **React**: 19.1.0
- **TypeScript**: 5.8.3
- **Vite**: 6.3.5
- **Tailwind CSS**: 3.4.17
- **Zustand**: 5.0.6
- **React Router DOM**: 7.7.1
- **ESLint**: 9.33.0

## 📁 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── Layout.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── pages/         # 페이지 컴포넌트
│   ├── Home.tsx
│   └── About.tsx
├── hooks/         # 커스텀 React 훅
│   ├── useLocalStorage.ts
│   ├── useWebView.ts
│   └── index.ts
├── store/         # Zustand 상태 관리
│   ├── counterStore.ts
│   └── index.ts
├── utils/         # 유틸리티 함수
│   └── index.ts
├── types/         # TypeScript 타입 정의
│   └── index.ts
├── assets/        # 정적 자산
│   ├── images/
│   ├── icons/
│   └── fonts/
├── styles/        # 스타일 파일
│   └── index.css
├── App.tsx        # 메인 앱 컴포넌트
└── main.tsx       # 앱 진입점
```

## 🛠️ 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 린트 검사
```bash
npm run lint
```

## 🌟 주요 기능

- **반응형 디자인**: 모바일과 데스크톱 모두 지원
- **상태 관리**: Zustand를 활용한 경량 상태 관리
- **라우팅**: React Router를 통한 SPA 라우팅
- **타입 안전성**: TypeScript를 통한 완전한 타입 체크
- **빠른 개발**: Vite를 통한 빠른 개발 서버와 빌드
- **모던 스타일링**: Tailwind CSS를 통한 유틸리티 우선 스타일링
- **웹뷰 지원**: 네이티브 앱과의 통신을 위한 웹뷰 훅 제공

## 📱 웹뷰 통신

웹뷰 환경에서 네이티브 앱과의 통신을 위해 `useWebView` 훅을 제공합니다:

```typescript
import { useWebView } from './hooks/useWebView'

const MyComponent = () => {
  const { isWebView, postMessage, onMessage } = useWebView()
  
  const handleSendMessage = () => {
    postMessage({
      type: 'NAVIGATE',
      payload: { screen: 'Profile' }
    })
  }
  
  return (
    <button onClick={handleSendMessage}>
      네이티브 앱으로 메시지 전송
    </button>
  )
}
```

## 🎨 스타일링

Tailwind CSS를 사용하여 유틸리티 우선 스타일링을 적용했습니다. 커스텀 컴포넌트 클래스도 제공합니다:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.card`
- `.input`, `.label`
- `.webview-container`, `.webview-safe-area`

## 📝 라이선스

MIT License

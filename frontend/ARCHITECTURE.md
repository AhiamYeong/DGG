# 🏗️ 프로젝트 아키텍처 문서

## 📋 목차
- [프로젝트 개요](#프로젝트-개요)
- [디렉토리 구조](#디렉토리-구조)
- [아키텍처 패턴](#아키텍처-패턴)
- [기술 스택](#기술-스택)
- [컴포넌트 계층](#컴포넌트-계층)
- [테스트 전략](#테스트-전략)
- [개발 가이드](#개발-가이드)

## 📖 프로젝트 개요

**S13P21A305 Frontend**는 네이버 지도 API를 활용한 교통 정보 서비스의 프론트엔드 애플리케이션입니다.

### 주요 기능
- 🗺️ 네이버 지도 통합
- 🔍 출발지/도착지/경유지 검색
- 📱 스와이프 가능한 바텀시트
- ⭐ 즐겨찾기 경로 관리
- 🎨 커스텀 디자인 시스템

## 📁 디렉토리 구조

### 루트 디렉토리
```
S13P21A305/frontend/
├── 📄 설정 파일들
│   ├── package.json              # 의존성 및 스크립트
│   ├── tsconfig.json             # TypeScript 설정
│   ├── vite.config.ts            # Vite 빌드 설정
│   ├── tailwind.config.js        # Tailwind CSS 설정
│   ├── jest.config.js            # Jest 테스트 설정
│   ├── eslint.config.js          # ESLint 설정
│   └── postcss.config.js         # PostCSS 설정
├── 🚪 진입점
│   ├── index.html                # HTML 진입점
│   └── src/App.tsx               # React 앱 진입점
└── 📊 빌드/테스트 결과
    ├── dist/                     # 빌드 결과물
    └── coverage/                 # 테스트 커버리지
```

### src/ 디렉토리 상세 구조

#### 🎯 핵심 애플리케이션
```
src/
├── App.tsx                       # 메인 앱 컴포넌트
├── router.tsx                    # React Router 설정
└── vite-env.d.ts                 # Vite 환경 변수 타입
```

#### 🛣️ 라우팅 시스템 (단순화된 페이지 기반)
```
src/pages/
├── FatiguePage.tsx               # 루트 페이지 (피로도)
├── MainMapPage.tsx               # 지도 페이지
├── PlanPage.tsx                  # 계획 페이지
├── AlarmPage.tsx                 # 알람 페이지
└── MyPage.tsx                    # 마이페이지
```

#### 🧩 컴포넌트 시스템 (정리된 구조)
```
src/components/
├── index.ts                      # 컴포넌트 내보내기
├── ui/                           # 기본 UI 컴포넌트
│   ├── Button.tsx                # 버튼 컴포넌트
│   └── Input.tsx                 # 입력 컴포넌트
└── functional/                   # 기능별 컴포넌트
    ├── NaverMap.tsx              # 네이버 지도 래퍼
    ├── SearchBox.tsx             # 검색 박스 (메인)
    ├── SearchInputField.tsx      # 검색 입력 필드
    ├── WaypointInput.tsx         # 경유지 입력
    ├── TimePickerModal/          # 시간 선택 모달
    │   └── index.tsx
    └── Route/                    # 경로 관련 컴포넌트
        └── FavoriteRoutesBottomSheet.tsx  # 즐겨찾기 바텀시트
```

#### 🎣 커스텀 훅 (최소화된 구조)
```
src/hooks/
├── useMapViewModel.ts            # 지도 뷰모델 (복잡한 지도 로직)
├── useBottomSheetSwipe.ts        # 바텀시트 스와이프 (복잡한 제스처)
├── useMapState.ts                # 지도 상태 관리
└── index.ts                      # 훅 내보내기
```

#### 🏪 상태 관리 (Zustand)
```
src/stores/
├── useRouteStore.ts              # 경로 상태 스토어
└── useSearchStore.ts             # 검색 상태 스토어
```

#### 🔧 서비스 레이어 (서버 API 전용)
```
src/services/
└── mapApi.ts                     # 서버 API 호출 전용 (네이버 지도 SDK는 NaverMap.tsx에서 직접 처리)
```

#### 📝 타입 정의
```
src/types/
├── index.ts                      # 타입 내보내기
├── common.ts                     # 공통 타입
├── naver-map.ts                  # 네이버 지도 타입
├── routes.ts                     # 경로 관련 타입
└── search.ts                     # 검색 관련 타입
```

#### 🎨 스타일링
```
src/styles/
└── index.css                     # 글로벌 스타일 + Tailwind
```

#### 🧪 테스트 시스템 (단순화된 구조)
```
src/
├── setupTests.ts                 # 테스트 환경 설정 (기본 모킹만)
└── __tests__/                    # 핵심 플로우 테스트
    ├── search-flow.test.tsx      # 검색 플로우 통합 테스트
    └── favorite-routes-flow.test.tsx  # 즐겨찾기 플로우 통합 테스트
```

## 🏛️ 아키텍처 패턴

### 1. 단순화된 아키텍처 패턴

```
View (Components) ←→ Store (Zustand) ←→ Services (API)
     ↓                    ↓                    ↓
- SearchBox.tsx    - useSearchStore      - mapApi.ts
- NaverMap.tsx     - useRouteStore       - 네이버 지도 SDK
- BottomSheet.tsx  - useBottomSheetSwipe - (복잡한 제스처만)
```

**MVP 단계 특징:**
- ViewModel 훅 최소화 (복잡한 UI 로직만 유지)
- Zustand store 직접 사용으로 개발 속도 향상
- 관심사의 분리 유지하면서 단순성 확보

### 2. 단순화된 페이지 기반 라우팅

```
router.tsx (중앙 라우터)
    ↓
pages/*.tsx (각 페이지 컴포넌트)
```

**특징:**
- 중첩 라우팅 제거로 단순화
- 페이지별 독립적인 컴포넌트
- 빠른 개발과 유지보수

### 3. 컴포넌트 계층 구조

```
App.tsx
├── RouterProvider
    ├── FatiguePage (pages/FatiguePage.tsx)
    ├── MainMapPage (pages/MainMapPage.tsx)
    │   ├── NaverMap (Layer 1)
    │   └── UI Components (Layer 2)
    │       ├── SearchBox
    │       │   ├── SearchInputField
    │       │   └── WaypointInput
    │       └── FavoriteRoutesBottomSheet
    ├── PlanPage (pages/PlanPage.tsx)
    ├── AlarmPage (pages/AlarmPage.tsx)
    └── MyPage (pages/MyPage.tsx)
```

## 🛠️ 기술 스택

### 프론트엔드 프레임워크
- **React 19** - 최신 React 기능 (자동 JSX 변환)
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 빌드 도구

### 라우팅 & 상태 관리
- **React Router v7** - 클라이언트 사이드 라우팅
- **Zustand** - 경량 상태 관리

### 스타일링
- **Tailwind CSS** - 유틸리티 퍼스트 CSS
- **Tailwind theme.extend.colors** - 브랜드 컬러 시스템 (CSS 변수 대신)

### 지도 & 제스처
- **네이버 지도 API** - 지도 서비스
- **@use-gesture/react** - 고급 제스처 처리

### 테스트 & 모킹
- **Jest** - 테스트 프레임워크
- **React Testing Library** - 컴포넌트 테스트
- **ts-jest** - TypeScript 테스트 지원
- **핵심 플로우 테스트** - 통합 테스트 중심

### 개발 도구
- **ESLint** - 코드 품질 관리
- **PostCSS** - CSS 후처리
- **Jest Coverage** - 테스트 커버리지

## 🎨 디자인 시스템

### 색상 팔레트 (Tailwind theme.extend.colors)
```javascript
// tailwind.config.js
colors: {
  // 기본 색상
  primary: '#0F4C81',      // 메인 블루
  secondary: '#A6BACC',    // 보조 블루
  accent: '#FFC107',       // 강조 노랑
  font: '#2A2D34',         // 텍스트
  background: '#FAFAFA',   // 배경
  
  // 끼임 정도 표현 색상
  'level-1': '#3DDC97',    // 여유
  'level-2': '#88E26F',    // 보통
  'level-3': '#FFD95E',    // 주의
  'level-4': '#FF8A50',    // 혼잡
  'level-5': '#E53945',    // 매우 혼잡
}
```

### 컴포넌트 스타일
- **버튼**: `btn-primary`, `btn-secondary`, `btn-accent`
- **카드**: `card` 클래스
- **유틸리티**: 색상별 `bg-*`, `text-*`, `border-*` 클래스

## 🧪 테스트 전략 (단순화된 구조)

### 테스트 구조
```
src/__tests__/
├── search-flow.test.tsx          # 검색 플로우 통합 테스트
│   ├── 출발지/도착지 입력 테스트
│   ├── 경유지 추가/제거 테스트
│   ├── 최대 경유지 제한 테스트
│   └── 입력값 클리어 테스트
└── favorite-routes-flow.test.tsx # 즐겨찾기 플로우 통합 테스트
    ├── 경로 목록 표시 테스트
    ├── 경로 선택 테스트
    ├── 새 경로 추가 테스트
    └── 즐겨찾기 표시 테스트
```

### 모킹 전략 (최소화)
- **브라우저 API**: `window.matchMedia`, `navigator.geolocation`
- **네이버 지도 API**: 기본 모킹만 구현
- **복잡한 모킹 제거**: MSW, 환경 변수 모킹 등 제거

### 커버리지 목표 (MVP 단계)
- **핵심 플로우**: 100% 테스트
- **Store/Service**: 50% 이상
- **전체 커버리지**: 확장 단계에서 점진적 향상

## 🚀 개발 가이드

### 프로젝트 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage

# 린팅
npm run lint
```

### 코드 컨벤션
- **컴포넌트**: PascalCase (예: `SearchBox.tsx`)
- **훅**: camelCase with `use` prefix (예: `useMapViewModel.ts`)
- **타입**: PascalCase (예: `NaverMapLocation`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_WAYPOINTS`)

### 파일 명명 규칙
- **컴포넌트**: `ComponentName.tsx`
- **훅**: `useHookName.ts`
- **타입**: `type-name.ts`
- **테스트**: `ComponentName.test.tsx`
- **페이지**: `PageName.tsx`

### Git 브랜치 전략
- **main**: 프로덕션 브랜치
- **develop**: 개발 브랜치
- **feature/**: 기능 개발 브랜치
- **hotfix/**: 긴급 수정 브랜치

## 📊 현재 상태

### ✅ 완성된 기능
- 🗺️ 네이버 지도 통합
- 🔍 검색 박스 (출발지/도착지/경유지)
- 📱 스와이프 가능한 바텀시트
- 🎨 Tailwind 기반 디자인 시스템
- 🧪 핵심 플로우 테스트
- 📱 반응형 디자인
- 🏗️ 단순화된 아키텍처

### 🚧 진행 중인 기능
- 🛣️ 경로 검색 및 안내
- ⏰ 시간 선택 모달
- 📋 즐겨찾기 관리
- 🔔 알람 시스템

### 📈 성능 지표
- **번들 크기**: 최적화됨
- **로딩 시간**: < 2초
- **테스트 커버리지**: 핵심 플로우 100%
- **타입 커버리지**: 100%
- **개발 속도**: MVP 단계 최적화



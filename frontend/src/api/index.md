# API 명세서

이 문서는 프로젝트의 API 구조와 각 엔드포인트의 구현 상태를 설명합니다.

## 📁 API 파일 구조

### 🔔 알림 관련 API (`alarmApi.ts`)
- **알림 리스트 조회** - `GET /api/v1/alarm` - **구현**
- **알림 생성** - `POST /api/v1/alarm` - **구현**
- **알림 수정** - `PUT /api/v1/alarm/{eventId}` - **구현**
- **알림 on/off** - `PATCH /api/v1/alarm/{alarmId}` - **구현**
- **알림 삭제** - `DELETE /api/v1/alarm/{alarmId}` - **구현**
- **가까운 알림** - `GET /api/v1/alarm/next` - **구현**

### 📌 즐겨찾기 관련 API

#### 경로 즐겨찾기 (`favoriteRoutes.ts`)
- **경로 즐겨찾기 목록 조회** - `GET /api/v1/bookmarks/routes` - **구현**
- **경로 즐겨찾기 추가** - `POST /api/v1/bookmarks/routes` - **구현**
  - 요청 형식: `{ name, departureName, destinationName, routeKey }`
- **경로 안내 완료 후 즐겨찾기 추가** - `POST /api/v1/bookmarks/routes` - **구현**
  - 요청 형식: `{ name, departureName, destinationName, routeId }`
- **경로 즐겨찾기 수정** - `PUT /api/v1/bookmarks/routes/{bookmarkRouteId}` - **구현**
- **경로 즐겨찾기 삭제** - `DELETE /api/v1/bookmarks/routes/{bookmarkRouteId}` - **구현**
- **경로 즐겨찾기 상세조회** - `GET /api/v1/bookmarks/routes/{bookmarkRouteId}` - **구현예정**

#### 장소 즐겨찾기 (`favoritePlacesApi.ts`)
- **장소 즐겨찾기 목록 조회** - `GET /api/v1/bookmarks/places` - **구현**
- **장소 즐겨찾기 추가** - `POST /api/v1/bookmarks/places` - **구현**
- **장소 즐겨찾기 수정** - `PUT /api/v1/bookmarks/places/{placeId}` - **구현**
- **장소 즐겨찾기 삭제** - `DELETE /api/v1/bookmarks/places/{placeId}` - **구현**

### 😴 피로도 관련 API (`fatigueApi.ts`)
- **현재 피로도 조회** - `GET /api/v1/fatigues` - **구현**
- **피로도 수정 (감소 로직)** - `PUT /api/v1/fatigues` - **구현**
- **피로도 하루 히스토리 조회** - `GET /api/v1/fatigues/daily` - **구현**
- **피로도 일주일 통계 조회** - `GET /api/v1/info/fatigues` - **구현**
- **걸음수 일주일 통계 조회** - `GET /api/v1/info/foot-steps` - **구현**

### 🏠 메인페이지 관련 API (`mainPageApi.ts`)
- **메인화면 조회** - `GET /api/v1/home` - **구현예정** (deprecated)
- **날씨 조회** - `GET /api/v1/weather` - **구현예정**

### 🗺️ 지도 관련 API (`mapApi.ts`)
- **3가지 길찾기 생성** - `POST /api/v1/maps/routes` - **구현**
- **선택한 경로를 DB에 저장** - `POST /api/v1/maps/routes/{routeKey}/start` - **구현**
- **상세경로 조회 (길안내 시작)** - `GET /api/v1/maps/routes/{routeId}` - **구현**
- **예약 추가** - `POST /api/v1/maps/books/{routeKey}` - **구현예정**

### 👤 마이페이지 관련 API (`mypageApi.ts`)
- **사용자 정보 조회** - `GET /api/v1/users/profile` - **구현예정**
- **사용자 정보 수정** - `PUT /api/v1/users/profile` - **구현예정**
- **알람 설정 조회** - `GET /api/v1/users/alarm-settings` - **구현예정**
- **알람 설정 수정** - `PUT /api/v1/users/alarm-settings` - **구현예정**

### 🔍 장소 검색 관련 API (`placeSearchApi.ts`)
- **장소(도착지) 검색 조회** - `GET /api/v1/search/places?query={장소명}` - **구현**

### 🛣️ 경로 서비스 관련 API (`routeService.ts`)
- **경로 검색 플로우 실행** - 비즈니스 로직 - **구현**
- **API 응답 데이터 변환** - 데이터 변환 로직 - **구현**
- **안내시작 처리 (2단계 API 호출)** - 비즈니스 로직 - **구현**
- **상세 경로 데이터 변환** - 데이터 변환 로직 - **구현**

### 📚 검색 기록 관련 API (`searchHistoryApi.ts`)
- **최근 검색 내역 조회** - `GET /api/v1/search/recent` - **구현**
- **최근 검색 내역 추가** - `POST /api/v1/search/recent` - **구현**
- **최근 검색 내역 삭제** - `DELETE /api/v1/search/recent/{id}` - **구현**

## 🔧 공통 설정

### API Base URL
```
https://j13a305.p.ssafy.io/api/
```

### 네이버 지도 API
- 클라이언트 ID: 환경변수 `VITE_NAVER_MAP_CLIENT_ID` 사용
- 스크립트 로드: `https://oapi.map.naver.com/openapi/v3/maps.js`

## 📊 구현 상태 요약

### ✅ 구현 완료 (26개)
- **알림 관련**: 6개 엔드포인트
- **경로 즐겨찾기**: 5개 엔드포인트
- **장소 즐겨찾기**: 4개 엔드포인트
- **피로도 관련**: 5개 엔드포인트
- **지도 관련**: 3개 엔드포인트
- **장소 검색**: 1개 엔드포인트
- **경로 서비스**: 4개 비즈니스 로직
- **검색 기록**: 3개 엔드포인트

### 🚧 구현 예정 (7개)
- **메인페이지**: 2개 엔드포인트
- **마이페이지**: 4개 엔드포인트
- **지도 관련**: 1개 엔드포인트 (예약 추가)

## 📋 사용 예시

### 알림 생성
```typescript
import { alarmApi } from './api/alarmApi';

const newAlarm = {
  eventTitle: "회의",
  departureTime: "2024-01-15T09:00:00",
  departure: "강남역",
  destination: "여의도역",
  offsetMinutesList: [10, 30],
  enabled: true
};
```

### 경로 검색
```typescript
import { RouteService } from './api/routeService';

const result = await RouteService.executeRouteSearchFlow(
  "강남역",
  "여의도역",
  new Date(),
  "now"
);
```

### 장소 검색
```typescript
import { searchPlaces } from './api/placeSearchApi';

const results = await searchPlaces("강남역", {
  display: 10,
  sort: 'comment'
});
```

## 🚀 개발 가이드

1. **새로운 API 추가 시**:
   - 해당 기능에 맞는 파일에 추가하거나 새 파일 생성
   - 타입 정의를 명확히 작성
   - 에러 처리 로직 포함

2. **API 호출 시**:
   - `createApiClient`를 사용하여 일관된 클라이언트 생성
   - `apiCall` 유틸리티를 사용하여 에러 처리
   - 로깅을 위한 `log` 유틸리티 활용

3. **타입 정의**:
   - 모든 API 요청/응답에 대한 타입 정의
   - `types/api-types.ts`에 공통 타입 정의
   - 각 API 파일에서 필요한 타입 import


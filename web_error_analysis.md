# 웹 환경 API 에러 분석 및 해결방안

## 📋 문제 상황

**발생 일시**: 2025-09-21 13:33  
**문제**: 웹 환경에서만 500 에러 발생, curl로는 정상 작동  
**요청 데이터**:
```json
{
  "departureAddress": "서울특별시 강남구 강남대로 396",
  "destinationAddress": "서울특별시 종로구 율곡로 62",
  "stopoverAddresses": [],
  "startTime": "2025-09-21 22:33:16"
}
```

**에러 응답**:
```json
{
  "timestamp": "2025-09-21T13:33:17.095+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/v1/maps/routes"
}
```

## 🔍 원인 분석

### 1. **API 서버 URL 불일치** ⚠️ **주요 원인**

**프론트엔드 설정**:
```typescript
// frontend/src/api/mapApi.ts
const API_BASE_URL = 'https://j13a305.p.ssafy.io/api/';
```

**실제 테스트 환경**:
- 로컬 서버: `http://localhost:8080`
- 배포 서버: `https://j13a305.p.ssafy.io`

### 2. **환경별 차이점**

| 환경 | API URL | 결과 | 원인 |
|---|---|---|---|
| curl 테스트 | `http://localhost:8080` | ✅ 성공 | 로컬 서버 정상 작동 |
| 웹 환경 | `https://j13a305.p.ssafy.io` | ❌ 500 에러 | 배포 서버 문제 |

### 3. **curl 테스트 결과**

**로컬 서버 테스트**:
```bash
curl -X POST "http://localhost:8080/api/v1/maps/routes" \
  -H "Content-Type: application/json" \
  --data '{"departureAddress":"서울특별시 강남구 강남대로 396","destinationAddress":"서울특별시 종로구 율곡로 62","stopoverAddresses":[],"startTime":"2025-09-21 22:33:16"}'
```

**결과**: ✅ **성공**
```json
{
  "departureAddress": "서울특별시 강남구 강남대로 396",
  "destinationAddress": "서울특별시 종로구 율곡로 62",
  "stopoverAddresses": [],
  "departureTime": "2025-09-21 22:33:16",
  "destinationTime": "2025-09-21 23:01:16",
  "recommendedRoutes": [
    {
      "routeId": "cdf5ef527f1cd4057b800615",
      "name": "최단 경로",
      "timeTaken": 51,
      "arrivalTime": "2025-09-21 23:24:16",
      "fatigue": 75
    },
    {
      "routeId": "bae8d5de68b4456784c66767",
      "name": "최소 환승",
      "timeTaken": 28,
      "arrivalTime": "2025-09-21 23:01:16",
      "fatigue": 60
    }
  ]
}
```

## 🛠️ 해결방안

### 방안 1: 로컬 개발 환경 설정 (권장)

**프론트엔드 API URL을 로컬로 변경**:

```typescript
// frontend/src/api/mapApi.ts
const API_BASE_URL = 'http://localhost:8080/api/'; // 로컬 개발용
// const API_BASE_URL = 'https://j13a305.p.ssafy.io/api/'; // 배포용
```

**환경 변수 활용**:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/';
```

**환경 변수 설정** (`.env.local`):
```
VITE_API_BASE_URL=http://localhost:8080/api/
```

### 방안 2: 배포 서버 문제 해결

**배포 서버 상태 확인**:
1. 배포 서버가 정상 실행 중인지 확인
2. 데이터베이스 연결 상태 확인
3. 외부 API (ODSay, Naver) 연결 상태 확인
4. 서버 로그 확인

**배포 서버 테스트**:
```bash
curl -X POST "https://j13a305.p.ssafy.io/api/v1/maps/routes" \
  -H "Content-Type: application/json" \
  --data '{"departureAddress":"서울특별시 강남구 강남대로 396","destinationAddress":"서울특별시 종로구 율곡로 62","stopoverAddresses":[],"startTime":"2025-09-21 22:33:16"}'
```

### 방안 3: 프록시 설정 (개발 환경)

**Vite 프록시 설정** (`vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

**프론트엔드 API URL 변경**:
```typescript
const API_BASE_URL = '/api/'; // 프록시 사용
```

## 🎯 권장 해결 순서

### 1단계: 로컬 개발 환경 설정
```typescript
// frontend/src/api/mapApi.ts
const API_BASE_URL = 'http://localhost:8080/api/';
```

### 2단계: 프론트엔드 재시작
```bash
cd frontend
npm run dev
```

### 3단계: 웹에서 테스트
- 브라우저에서 `http://localhost:3000` 접속
- 경로 검색 기능 테스트

### 4단계: 배포 서버 문제 해결 (필요시)
- 배포 서버 상태 확인
- 서버 로그 분석
- 데이터베이스 및 외부 API 연결 확인

## 📊 문제 요약

| 구분 | 로컬 서버 | 배포 서버 | 해결방안 |
|---|---|---|---|
| API URL | `http://localhost:8080` | `https://j13a305.p.ssafy.io` | 로컬 개발용 URL 사용 |
| 상태 | ✅ 정상 작동 | ❌ 500 에러 | 배포 서버 문제 해결 필요 |
| 테스트 | curl 성공 | 웹에서 실패 | 환경 설정 통일 |

## 🚀 결론

**문제의 핵심은 프론트엔드가 배포 서버를 호출하고 있지만, 배포 서버에서 500 에러가 발생하고 있다는 것입니다.**

**즉시 해결 방법**: 프론트엔드 API URL을 로컬 서버로 변경하여 개발을 계속 진행하고, 배포 서버 문제는 별도로 해결하는 것을 권장합니다.

**장기적 해결**: 배포 서버의 500 에러 원인을 파악하고 해결하여 프로덕션 환경에서도 정상 작동하도록 해야 합니다.

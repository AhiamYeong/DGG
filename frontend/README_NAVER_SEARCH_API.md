# 네이버 지역 검색 API 연동 가이드

## 📋 개요
이 프로젝트는 [네이버 지역 검색 API](https://developers.naver.com/docs/serviceapi/search/local/local.md)를 사용하여 실시간 장소 검색 기능을 구현합니다.

## 🔧 설정 방법

### 1. 네이버 개발자 센터에서 API 키 발급

1. **네이버 개발자 센터 가입**
   - [네이버 개발자 센터](https://developers.naver.com/) 접속
   - 네이버 계정으로 로그인

2. **애플리케이션 등록**
   - **Application** → **애플리케이션 등록**
   - 애플리케이션 이름, 설명 입력
   - **검색 API** 권한 선택
   - 등록 완료 후 **Client ID**와 **Client Secret** 발급

3. **API 사용 설정**
   - 애플리케이션 설정에서 **검색** API 사용 권한 활성화
   - 하루 호출 한도: 25,000회 (무료)

### 2. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```bash
# 네이버 검색 API 설정 (지역 검색용)
VITE_NAVER_CLIENT_ID=your_naver_search_client_id_here
VITE_NAVER_CLIENT_SECRET=your_naver_search_client_secret_here

# 네이버 Map API 설정 (지도 표시용)
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id_here

# 개발 환경 설정
NODE_ENV=development
```

**⚠️ 중요**: 
- **검색 API용** `VITE_NAVER_CLIENT_ID`와 `VITE_NAVER_CLIENT_SECRET` 설정 필요
- **지도 API용** `VITE_NAVER_MAP_CLIENT_ID`는 별도로 설정 필요
- `.env` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다

**📝 현재 상태 확인**:
- API 키가 설정되지 않은 경우: 에러 메시지 표시
- API 키가 설정된 경우: 실제 네이버 지역 검색 API 사용

## 🚀 사용 방법

### 기본 검색 기능

```typescript
import { useNaverSearch } from './hooks/useNaverSearch';

function SearchComponent() {
  const {
    searchQuery,
    searchState,
    handleSearchChange,
    clearSearch
  } = useNaverSearch({
    display: 10, // 최대 10개 결과
    sort: 'random' // 정확도순 정렬
  });

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="장소를 검색하세요"
      />
      
      {searchState.isLoading && <div>검색 중...</div>}
      {searchState.error && <div>에러: {searchState.error}</div>}
      {searchState.results.map(result => (
        <div key={result.id}>{result.name}</div>
      ))}
    </div>
  );
}
```

### 직접 API 호출

```typescript
import { searchPlacesWithNaver } from './services/naverSearchApi';

// 검색 실행
const response = await searchPlacesWithNaver('강남역', {
  display: 5,
  sort: 'random'
});

if (response.success) {
  console.log('검색 결과:', response.data);
  console.log('총 결과 수:', response.total);
} else {
  console.error('검색 실패:', response.message);
}
```

## 📁 파일 구조

```
src/
├── services/
│   └── naverSearchApi.ts        # 네이버 지역 검색 API 서비스
├── hooks/
│   ├── useDebounce.ts           # 디바운스 훅
│   └── useNaverSearch.ts        # 네이버 검색 API 훅
├── components/
│   └── functional/
│       └── Search/
│           └── SearchResultsList.tsx  # 검색 결과 리스트 컴포넌트
└── pages/
    └── SearchPage.tsx           # 검색 페이지
```

## 🔍 주요 기능

### 1. 실시간 검색
- **디바운스 처리**: 500ms 지연으로 API 호출 최적화
- **자동 검색**: 입력 시 자동으로 검색 실행
- **로딩 상태**: 검색 중 로딩 인디케이터 표시

### 2. 검색 결과 처리
- **HTML 태그 제거**: 네이버 API 응답의 HTML 태그 자동 제거
- **네이버 좌표계 사용**: 네이버 Map API와 호환되도록 좌표 그대로 사용
- **에러 처리**: API 오류 시 사용자 친화적 메시지 표시
- **실제 API만 사용**: 더미 데이터 제거, 실제 네이버 API만 사용

### 3. 검색 옵션
- **display**: 표시할 결과 개수 (1-5, 기본값: 5) - [네이버 API 문서](https://developers.naver.com/docs/serviceapi/search/local/local.md#%EC%A7%80%EC%97%AD) 기준
- **start**: 검색 시작 위치 (1-1000, 기본값: 1) - [네이버 API 문서](https://developers.naver.com/docs/serviceapi/search/local/local.md#%EC%A7%80%EC%97%AD) 기준
- **sort**: 정렬 방법 ('random' | 'comment') - [네이버 API 문서](https://developers.naver.com/docs/serviceapi/search/local/local.md#%EC%A7%80%EC%97%AD) 기준

## 📊 API 응답 형식

### 네이버 API 원본 응답
```json
{
  "lastBuildDate": "Tue, 04 Oct 2016 13:10:58 +0900",
  "total": 407,
  "start": 1,
  "display": 10,
  "items": [
    {
      "title": "조선옥",
      "link": "",
      "category": "한식>육류,고기요리",
      "description": "연탄불 한우갈비 전문점.",
      "telephone": "",
      "address": "서울특별시 중구 을지로3가 229-1",
      "roadAddress": "서울특별시 중구 을지로15길 6-5",
      "mapx": 311277,
      "mapy": 552097
    }
  ]
}
```

### 앱에서 사용하는 변환된 형식
```typescript
{
  id: "naver_0_1695123456789",
  name: "조선옥",
  address: "서울특별시 중구 을지로15길 6-5",
  category: "한식>육류,고기요리",
  description: "연탄불 한우갈비 전문점.",
  coordinates: {
    lat: 552097,  // 네이버 좌표계 그대로 사용 (네이버 Map API와 호환)
    lng: 311277
  },
  phone: "",
  link: ""
}
```

## ⚠️ 주의사항

### 1. API 사용량 제한
- **무료 플랜**: 하루 25,000회 호출 제한
- **유료 플랜**: 사용량에 따른 과금
- **모니터링**: 네이버 개발자 센터에서 사용량 확인 가능

### 2. 보안
- **Client Secret**: 절대 클라이언트에 노출하지 말 것
- **프록시 사용**: 프로덕션에서는 서버를 통한 프록시 사용 권장
- **HTTPS**: 프로덕션 환경에서는 HTTPS 필수

### 3. 에러 처리
- **403 오류**: API 권한 없음 - 클라이언트 ID/시크릿 확인
- **400 오류**: 잘못된 요청 - 파라미터 확인
- **429 오류**: 호출 한도 초과 - 잠시 후 재시도

## 🐛 문제 해결

### 1. API 키 오류
```
❌ 네이버 API 권한이 없습니다
```
**해결방법**: 
- 클라이언트 ID와 시크릿 확인
- 애플리케이션에서 검색 API 권한 활성화 확인

### 2. 검색 결과가 없음
**해결방법**:
- 검색어 확인 (한글, 영문 지원)
- 다른 검색어로 시도
- API 응답 로그 확인

### 3. CORS 오류
**해결방법**:
- 개발 환경에서는 프록시 설정
- 프로덕션에서는 서버를 통한 API 호출

## 📚 참고 자료

- [네이버 지역 검색 API 공식 문서](https://developers.naver.com/docs/serviceapi/search/local/local.md)
- [네이버 오픈 API 가이드](https://developers.naver.com/docs/common/openapiguide/)
- [네이버 개발자 센터](https://developers.naver.com/)

## 🔄 업데이트 내역

- **2025-09-16**: 네이버 지역 검색 API v1 연동 완료
- **2025-09-16**: 디바운스 처리 및 에러 핸들링 추가
- **2025-09-16**: 검색 결과 형식 변환 및 UI 개선

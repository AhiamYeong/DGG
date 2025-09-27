# 스토어 마이그레이션 가이드

## 기존 스토어 → 통합 스토어 매핑

### 1. useSearchStore → useUnifiedSearchStore

**기존 코드:**
```typescript
const { origin, destination, waypoints, setOrigin, setDestination } = useSearchStore();
```

**새로운 코드:**
```typescript
const { 
  searchInput: { origin, destination, waypoints },
  setOrigin, 
  setDestination 
} = useUnifiedSearchStore();
```

### 2. useRouteSearchStore → useUnifiedSearchStore

**기존 코드:**
```typescript
const { 
  routeResults, 
  currentOrigin, 
  currentDestination,
  startRouteSearch,
  selectRoute 
} = useRouteSearchStore();
```

**새로운 코드:**
```typescript
const { 
  searchResults: { routes: routeResults },
  currentSearch: { origin: currentOrigin, destination: currentDestination },
  executeSearch: startRouteSearch,
  selectRoute 
} = useUnifiedSearchStore();
```

### 3. useRouteStore → useUnifiedSearchStore

**기존 코드:**
```typescript
const { 
  favoriteRoutes, 
  addFavoriteRoute, 
  removeFavoriteRoute 
} = useRouteStore();
```

**새로운 코드:**
```typescript
const { 
  favorites: { routes: favoriteRoutes },
  addBookmarkForRoute: addFavoriteRoute,
  removeBookmarkForRoute: removeFavoriteRoute 
} = useUnifiedSearchStore();
```

## 컴포넌트 업데이트 예시

### SearchBox 컴포넌트 업데이트

**기존:**
```typescript
import { useSearchStore } from '../stores/useSearchStore';

export default function SearchBox() {
  const { origin, destination, waypoints, setOrigin, setDestination } = useSearchStore();
  // ...
}
```

**새로운:**
```typescript
import { useUnifiedSearchStore } from '../stores/useUnifiedSearchStore';

export default function SearchBox() {
  const { 
    searchInput: { origin, destination, waypoints },
    setOrigin, 
    setDestination 
  } = useUnifiedSearchStore();
  // ...
}
```

### MainMapPage 컴포넌트 업데이트

**기존:**
```typescript
import { useRouteSearchStore } from '../stores/useRouteSearchStore';

export default function MainMapPage() {
  const {
    routeResults,
    currentOrigin,
    currentDestination,
    startRouteSearch,
    selectRoute
  } = useRouteSearchStore();
  // ...
}
```

**새로운:**
```typescript
import { useUnifiedSearchStore } from '../stores/useUnifiedSearchStore';

export default function MainMapPage() {
  const {
    searchResults: { routes: routeResults },
    currentSearch: { origin: currentOrigin, destination: currentDestination },
    executeSearch: startRouteSearch,
    selectRoute
  } = useUnifiedSearchStore();
  // ...
}
```

## 타입 안정성 개선

### 기존 any 타입 제거

**기존:**
```typescript
interface Route {
  rawData?: any;
  polylineData?: any;
}
```

**새로운:**
```typescript
import { StrictRouteDetailResponse, StrictPolylineData } from '../types/strict-types';

interface Route {
  rawData?: StrictRouteDetailResponse;
  polylineData?: StrictPolylineData;
}
```

## 마이그레이션 체크리스트

- [ ] useSearchStore 사용하는 컴포넌트들 업데이트
- [ ] useRouteSearchStore 사용하는 컴포넌트들 업데이트  
- [ ] useRouteStore 사용하는 컴포넌트들 업데이트
- [ ] any 타입을 엄격한 타입으로 변경
- [ ] 기존 스토어 파일들 제거
- [ ] 테스트 코드 업데이트
- [ ] 문서 업데이트

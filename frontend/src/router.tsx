import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages for code splitting
const FatiguePage = lazy(() => import('./pages/FatiguePage'));
const MainMapPage = lazy(() => import('./pages/MainMapPage'));
const PlanPage = lazy(() => import('./pages/PlanPage'));
const AlarmPage = lazy(() => import('./pages/AlarmPage'));
const MyPage = lazy(() => import('./pages/MyPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// Create router with Suspense wrapper
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <FatiguePage />
      </Suspense>
    )
  },
  {
    path: '/map',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MainMapPage />
      </Suspense>
    )
  },
  {
    path: '/plan',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PlanPage />
      </Suspense>
    )
  },
  {
    path: '/alarm',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AlarmPage />
      </Suspense>
    )
  },
  {
    path: '/mypage',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MyPage />
      </Suspense>
    )
  },
  {
    path: '/search',
    element: (
      <Suspense fallback={<PageLoader />}>
        <SearchPage />
      </Suspense>
    )
  }
]);

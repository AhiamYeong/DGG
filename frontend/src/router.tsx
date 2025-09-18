import { createBrowserRouter } from 'react-router-dom';

// Page imports
import FatiguePage from './pages/FatiguePage';
import MainMapPage from './pages/MainMapPage';
import PlanPage from './pages/PlanPage';
import AlarmPage from './pages/AlarmPage';
import MyPage from './pages/MyPage';
import SearchPage from './pages/SearchPage';

// Create router
export const router = createBrowserRouter([
  {
    path: '/',
    element: <FatiguePage />
  },
  {
    path: '/map',
    element: <MainMapPage />
  },
  {
    path: '/plan',
    element: <PlanPage />
  },
  {
    path: '/alarm',
    element: <AlarmPage />
  },
  {
    path: '/mypage',
    element: <MyPage />
  },
  {
    path: '/search',
    element: <SearchPage />
  }
]);

import { createBrowserRouter } from 'react-router-dom';

// Route imports
import Layout from './routes/_layout/route';
import IndexRoute from './routes/_index/route';
import MapRoute from './routes/map/route';
import PlanRoute from './routes/plan/route';
import AlarmRoute from './routes/alarm/route';
import MyPageRoute from './routes/mypage/route';

// Create router
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <IndexRoute /> },
      { path: 'map', element: <MapRoute /> },
      { path: 'plan', element: <PlanRoute /> },
      { path: 'alarm', element: <AlarmRoute /> },
      { path: 'mypage', element: <MyPageRoute /> }
    ]
  }
]);

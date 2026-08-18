import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '../ui/layouts/AppLayout';
import { FixedAccountsPage } from '../ui/pages/FixedAccountsPage';
import { HomePage } from '../ui/pages/HomePage';
import { MonthlyAnalysisPage } from '../ui/pages/MonthlyAnalysisPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'contas-fixas', element: <FixedAccountsPage /> },
      { path: 'analises/:year/:month', element: <MonthlyAnalysisPage /> },
    ],
  },
]);

import { createBrowserRouter } from 'react-router-dom';

import { FixedAccountsPage } from '../ui/pages/FixedAccountsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <FixedAccountsPage />,
  },
]);

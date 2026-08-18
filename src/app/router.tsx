import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from '../ui/pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);

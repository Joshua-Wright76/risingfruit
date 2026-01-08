import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { LandingPage } = await import('./pages/LandingPage');
      return { Component: LandingPage };
    },
  },
  {
    path: '/app',
    lazy: async () => {
      const { AppPage } = await import('./pages/AppPage');
      return { Component: AppPage };
    },
  },
]);

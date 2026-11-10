
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () =>
      import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./tabs/tabs.routes').then((m) => m.tabsRoutes),
      },
    ],
  },
  {
    path: 'game-detail/:id',
    loadComponent: () =>
      import('./pages/game-detail/game-detail.page').then(
        (m) => m.GameDetailPage
      ),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.page').then(
        (m) => m.CheckoutPage
      ),
  },
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'tabs/inicio',
  },
];

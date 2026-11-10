
import { Routes } from '@angular/router';

export const tabsRoutes: Routes = [
  {
    path: 'inicio',
    loadComponent: () =>
      import('../pages/dashboard/dashboard.page').then(
        (m) => m.DashboardPage
      ),
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('../home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('../pages/cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('../pages/orders/orders.page').then((m) => m.OrdersPage),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('../pages/profile/profile.page').then((m) => m.ProfilePage),
  },
];

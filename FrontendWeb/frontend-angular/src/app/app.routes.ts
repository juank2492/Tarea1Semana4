import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register').then(m => m.RegisterComponent)
  },
  {
    path: 'menu',
    loadComponent: () => import('./components/menu').then(m => m.MenuComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart').then(m => m.CartComponent)
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./components/pedidos').then(m => m.PedidosComponent)
  },
  // TODO: Agregar cuando creemos estos componentes
  // {
  //   path: 'reservas',
  //   loadComponent: () => import('./components/reservas/reservas.component').then(m => m.ReservasComponent)
  // },
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./components/admin/admin.routes').then(m => m.adminRoutes)
  // },
  {
    path: '**',
    redirectTo: ''
  }
];

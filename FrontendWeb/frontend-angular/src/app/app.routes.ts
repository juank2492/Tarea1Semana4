import { Routes } from '@angular/router';
import { authGuard, adminGuard, clientGuard, employeeGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas de autenticación (sin layout)
  {
    path: '',
    loadComponent: () => import('./components/auth/login').then(m => m.LoginComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login').then(m => m.LoginComponent)
  },
  {
    path: 'register', 
    loadComponent: () => import('./components/auth/register').then(m => m.RegisterComponent)
  },
  // Layout administrativo con rutas anidadas
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./components/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      // Redirección por defecto
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      
      // Dashboard principal (redirige según el rol)
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      
      // Dashboard administrativo
      {
        path: 'admin/dashboard',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      
      // Rutas administrativas (solo Admin)
      {
        path: 'admin/usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/admin/usuarios/usuarios-admin.component').then(m => m.UsuariosAdminComponent)
      },
      {
        path: 'admin/productos',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/admin/productos/productos-admin.component').then(m => m.ProductosAdminComponent)
      },
      {
        path: 'admin/categorias',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/admin/categorias/categorias-admin.component').then(m => m.CategoriasAdminComponent)
      },
      {
        path: 'admin/pedidos',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/admin/pedidos/pedidos-admin.component').then(m => m.PedidosAdminComponent)
      },
      {
        path: 'admin/reservas',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/admin/reservas/reservas-admin.component').then(m => m.ReservasAdminComponent)
      },
      
      // Rutas para Empleados
      {
        path: 'empleado/productos',
        canActivate: [employeeGuard],
        loadComponent: () => import('./components/admin/productos/productos-admin.component').then(m => m.ProductosAdminComponent)
      },
      {
        path: 'empleado/categorias',
        canActivate: [employeeGuard],
        loadComponent: () => import('./components/admin/categorias/categorias-admin.component').then(m => m.CategoriasAdminComponent)
      },
      {
        path: 'empleado/pedidos',
        canActivate: [employeeGuard],
        loadComponent: () => import('./components/admin/pedidos/pedidos-admin.component').then(m => m.PedidosAdminComponent)
      },
      {
        path: 'empleado/reservas',
        canActivate: [employeeGuard],
        loadComponent: () => import('./components/admin/reservas/reservas-admin.component').then(m => m.ReservasAdminComponent)
      },
      
      // Rutas para Clientes
      {
        path: 'menu',
        canActivate: [clientGuard],
        loadComponent: () => import('./components/menu').then(m => m.MenuComponent)
      },
      {
        path: 'cart',
        canActivate: [clientGuard],
        loadComponent: () => import('./components/cart').then(m => m.CartComponent)
      },
      {
        path: 'pedidos',
        canActivate: [clientGuard],
        loadComponent: () => import('./components/pedidos').then(m => m.PedidosComponent)
      },
      {
        path: 'reservas',
        canActivate: [clientGuard], 
        loadComponent: () => import('./components/reservas/reservas.component').then(m => m.ReservasComponent)
      }
    ]
  },
  
  // Ruta de fallback
  {
    path: '**',
    redirectTo: 'login'
  }
];

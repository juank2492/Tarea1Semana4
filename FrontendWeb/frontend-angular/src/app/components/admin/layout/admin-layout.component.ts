import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Header -->
      <header class="admin-header">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
          <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="#">
              <i class="fas fa-utensils me-2"></i>
              Admin Panel
            </a>
            
            <button class="navbar-toggler" type="button" (click)="toggleSidebar()">
              <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="navbar-nav ms-auto">
              <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" 
                   id="userDropdown" data-bs-toggle="dropdown">
                  <i class="fas fa-user-circle me-2"></i>
                  {{ currentUser()?.nombreUsuario || 'Admin' }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Perfil</a></li>
                  <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Configuración</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger" (click)="logout()">
                    <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                  </button></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div class="admin-content-wrapper">
        <!-- Sidebar -->
        <aside class="admin-sidebar" [class.collapsed]="sidebarCollapsed()">
          <div class="sidebar-content">
            <div class="sidebar-header">
              <h5 class="mb-0">Menú Principal</h5>
            </div>
            
            <nav class="sidebar-nav">
              <ul class="nav flex-column">
                <li class="nav-item">
                  <a class="nav-link" routerLink="/app/admin/dashboard" routerLinkActive="active">
                    <i class="fas fa-tachometer-alt"></i>
                    <span class="nav-text">Dashboard</span>
                  </a>
                </li>
                
                <!-- Gestión de Usuarios (Solo Admin) -->
                <li class="nav-item" *ngIf="isAdmin()">
                  <a class="nav-link" routerLink="/app/admin/usuarios" routerLinkActive="active">
                    <i class="fas fa-users"></i>
                    <span class="nav-text">Usuarios</span>
                  </a>
                </li>
                
                <!-- Gestión de Productos -->
                <li class="nav-item">
                  <a class="nav-link" [routerLink]="getProductsRoute()" routerLinkActive="active">
                    <i class="fas fa-box"></i>
                    <span class="nav-text">Productos</span>
                  </a>
                </li>
                
                <!-- Gestión de Categorías -->
                <li class="nav-item">
                  <a class="nav-link" [routerLink]="getCategoriesRoute()" routerLinkActive="active">
                    <i class="fas fa-tags"></i>
                    <span class="nav-text">Categorías</span>
                  </a>
                </li>
                
                <!-- Gestión de Pedidos -->
                <li class="nav-item">
                  <a class="nav-link" [routerLink]="getOrdersRoute()" routerLinkActive="active">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="nav-text">Pedidos</span>
                  </a>
                </li>
                
                <!-- Gestión de Reservas -->
                <li class="nav-item">
                  <a class="nav-link" [routerLink]="getReservationsRoute()" routerLinkActive="active">
                    <i class="fas fa-calendar-check"></i>
                    <span class="nav-text">Reservas</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="admin-main">
          <div class="content-header">
            <button class="btn btn-outline-secondary me-3" (click)="toggleSidebar()">
              <i class="fas fa-bars"></i>
            </button>
            <h1 class="h4 mb-0">Panel de Administración</h1>
          </div>
          
          <div class="content-body">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  sidebarCollapsed = signal(false);
  currentUser = signal<any>(null);
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser.set(this.authService.getCurrentUser());
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  isAdmin(): boolean {
    return this.currentUser()?.rol === 'Admin';
  }

  getProductsRoute(): string {
    return this.isAdmin() ? '/app/admin/productos' : '/app/empleado/productos';
  }

  getCategoriesRoute(): string {
    return this.isAdmin() ? '/app/admin/categorias' : '/app/empleado/categorias';
  }

  getOrdersRoute(): string {
    return this.isAdmin() ? '/app/admin/pedidos' : '/app/empleado/pedidos';
  }

  getReservationsRoute(): string {
    return this.isAdmin() ? '/app/admin/reservas' : '/app/empleado/reservas';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

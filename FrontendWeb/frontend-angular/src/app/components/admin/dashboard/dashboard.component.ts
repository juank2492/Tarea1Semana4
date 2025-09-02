import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0
  });
  
  loading = signal(true);
  currentTime = new Date().toLocaleString('es-ES', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  });

  constructor(
    public authService: AuthService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Cargar estadísticas del dashboard
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.stats.update(current => ({
          ...current,
          totalProducts: productos.length
        }));
      },
      error: (error) => console.error('Error loading products:', error)
    });

    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.stats.update(current => ({
          ...current,
          totalCategories: categorias.length
        }));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading.set(false);
      }
    });

    // Simular datos para usuarios y pedidos hasta que tengamos esas APIs
    this.stats.update(current => ({
      ...current,
      totalUsers: 5,
      totalOrders: 12
    }));
  }
}

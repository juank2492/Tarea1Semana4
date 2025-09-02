import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { Categoria, Producto } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  productosDestacados = signal<Producto[]>([]);
  loading = signal(true);

  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Cargar categorías
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    // Cargar productos destacados (los primeros 6)
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productosDestacados.set(productos.slice(0, 6));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }
}

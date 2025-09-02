import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { ProductoService } from '../../services/producto.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Categoria, Producto } from '../../models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  productos = signal<Producto[]>([]);
  productosFiltrados = computed(() => {
    const productos = this.productos();
    const categoriaSeleccionada = this.categoriaSeleccionada();
    const busqueda = this.busqueda().toLowerCase().trim();

    let filtrados = productos;

    if (categoriaSeleccionada) {
      filtrados = filtrados.filter(p => p.categoriaId === categoriaSeleccionada);
    }

    if (busqueda) {
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(busqueda) ||
        p.descripcion.toLowerCase().includes(busqueda)
      );
    }

    return filtrados;
  });

  categoriaSeleccionada = signal<number | null>(null);
  busqueda = signal('');
  loading = signal(true);
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private cartService: CartService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
    
    // Verificar si hay una categoría preseleccionada en la URL
    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.categoriaSeleccionada.set(+params['categoria']);
      }
    });
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

    // Cargar productos
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }

  filtrarPorCategoria(categoriaId: number | null): void {
    this.categoriaSeleccionada.set(categoriaId);
  }

  onBusquedaChange(event: any): void {
    this.busqueda.set(event.target.value);
  }

  agregarAlCarrito(producto: Producto): void {
    if (!this.isAuthenticated()) {
      this.toastr.warning('Debes iniciar sesión para agregar productos al carrito', 'Inicio de sesión requerido');
      return;
    }

    if (!producto.disponible) {
      this.toastr.warning('Este producto no está disponible actualmente', 'Producto no disponible');
      return;
    }

    this.cartService.addToCart(producto);
    this.toastr.success(`${producto.nombre} agregado al carrito`, 'Producto agregado');
  }
}

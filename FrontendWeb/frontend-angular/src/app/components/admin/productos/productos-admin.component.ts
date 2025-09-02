import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Producto, Categoria } from '../../../models/models';

@Component({
  selector: 'app-productos-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos-admin.component.html',
  styleUrl: './productos-admin.component.css'
})
export class ProductosAdminComponent implements OnInit {
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  loading = signal(false);
  showForm = signal(false);
  editingProduct = signal<Producto | null>(null);
  productoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private toastr: ToastrService
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      categoriaId: ['', [Validators.required]],
      imagenUrl: [''], // No required - opcional
      disponible: [true]
    });
  }

  ngOnInit(): void {
    this.loadProductos();
    this.loadCategorias();
  }

  loadProductos(): void {
    this.loading.set(true);
    this.productoService.getProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productos.set(productos);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.toastr.error('Error al cargar los productos', 'Error');
        this.loading.set(false);
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias.set(categorias);
      },
      error: (error: any) => {
        console.error('Error al cargar categorías:', error);
        this.toastr.error('Error al cargar las categorías', 'Error');
      }
    });
  }

  showCreateForm(): void {
    this.editingProduct.set(null);
    this.productoForm.reset();
    this.productoForm.patchValue({ disponible: true });
    this.showForm.set(true);
  }

  editProducto(producto: Producto): void {
    this.editingProduct.set(producto);
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoriaId: producto.categoriaId,
      imagenUrl: producto.imagenUrl,
      disponible: producto.disponible
    });
    this.showForm.set(true);
  }

  onSubmit(): void {
    if (this.productoForm.valid && !this.loading()) {
      this.loading.set(true);
      
      const formData = this.productoForm.value;
      
      if (this.editingProduct()) {
        // Actualizar producto existente
        this.productoService.updateProducto(this.editingProduct()!.productoId, formData).subscribe({
          next: () => {
            this.toastr.success('Producto actualizado exitosamente', 'Éxito');
            this.loadProductos();
            this.hideForm();
          },
          error: (error: any) => {
            console.error('Error al actualizar producto:', error);
            this.toastr.error('Error al actualizar el producto', 'Error');
            this.loading.set(false);
          }
        });
      } else {
        // Crear nuevo producto
        this.productoService.createProducto(formData).subscribe({
          next: () => {
            this.toastr.success('Producto creado exitosamente', 'Éxito');
            this.loadProductos();
            this.hideForm();
            this.loading.set(false);
          },
          error: (error: any) => {
            console.error('Error al crear producto:', error);
            
            // Mostrar detalles específicos del error
            let errorMessage = 'Error al crear el producto';
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.errors) {
              // Errores de validación de Model State
              const validationErrors = Object.keys(error.error.errors)
                .map(key => `${key}: ${error.error.errors[key].join(', ')}`)
                .join('\n');
              errorMessage = `Errores de validación:\n${validationErrors}`;
            }
            
            this.toastr.error(errorMessage, 'Error');
            this.loading.set(false);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  deleteProducto(producto: Producto): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`)) {
      this.loading.set(true);
      this.productoService.deleteProducto(producto.productoId).subscribe({
        next: () => {
          this.toastr.success('Producto eliminado exitosamente', 'Éxito');
          this.loadProductos();
        },
        error: (error: any) => {
          console.error('Error al eliminar producto:', error);
          this.toastr.error('Error al eliminar el producto', 'Error');
          this.loading.set(false);
        }
      });
    }
  }

  toggleDisponibilidad(producto: Producto): void {
    const nuevoEstado = !producto.disponible;
    const productoActualizado = { ...producto, disponible: nuevoEstado };
    
    this.productoService.updateProducto(producto.productoId, productoActualizado).subscribe({
      next: () => {
        const mensaje = nuevoEstado ? 'Producto activado' : 'Producto desactivado';
        this.toastr.success(mensaje, 'Éxito');
        this.loadProductos();
      },
      error: (error: any) => {
        console.error('Error al cambiar disponibilidad:', error);
        this.toastr.error('Error al cambiar la disponibilidad', 'Error');
      }
    });
  }

  hideForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
    this.productoForm.reset();
    this.loading.set(false);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productoForm.controls).forEach(key => {
      const control = this.productoForm.get(key);
      control?.markAsTouched();
    });
  }

  getCategoriaNombre(categoriaId: number): string {
    const categoria = this.categorias().find(c => c.categoriaId === categoriaId);
    return categoria?.nombre || 'N/A';
  }

  // Getters para el formulario
  get nombre() { return this.productoForm.get('nombre'); }
  get descripcion() { return this.productoForm.get('descripcion'); }
  get precio() { return this.productoForm.get('precio'); }
  get categoriaId() { return this.productoForm.get('categoriaId'); }
  get imagenUrl() { return this.productoForm.get('imagenUrl'); }
  get disponible() { return this.productoForm.get('disponible'); }
}

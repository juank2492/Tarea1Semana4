import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/models';

@Component({
  selector: 'app-categorias-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categorias-admin.component.html',
  styleUrl: './categorias-admin.component.css'
})
export class CategoriasAdminComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  loading = signal(false);
  showForm = signal(false);
  editingCategory = signal<Categoria | null>(null);
  categoriaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private toastr: ToastrService
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required]],
      imagenUrl: [''],
      activa: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading.set(true);
    this.categoriaService.getCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias.set(categorias);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar categorías:', error);
        this.toastr.error('Error al cargar las categorías', 'Error');
        this.loading.set(false);
      }
    });
  }

  showCreateForm(): void {
    this.editingCategory.set(null);
    this.categoriaForm.reset();
    this.categoriaForm.patchValue({ activa: true });
    this.showForm.set(true);
  }

  editCategoria(categoria: Categoria): void {
    this.editingCategory.set(categoria);
    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      imagenUrl: categoria.imagenUrl,
      activa: categoria.activa
    });
    this.showForm.set(true);
  }

  onSubmit(): void {
    if (this.categoriaForm.valid && !this.loading()) {
      this.loading.set(true);
      
      const formData = this.categoriaForm.value;
      
      if (this.editingCategory()) {
        // Actualizar categoría existente
        this.categoriaService.updateCategoria(this.editingCategory()!.categoriaId, formData).subscribe({
          next: () => {
            this.toastr.success('Categoría actualizada exitosamente', 'Éxito');
            this.loadCategorias();
            this.hideForm();
          },
          error: (error: any) => {
            console.error('Error al actualizar categoría:', error);
            this.toastr.error('Error al actualizar la categoría', 'Error');
            this.loading.set(false);
          }
        });
      } else {
        // Crear nueva categoría
        this.categoriaService.createCategoria(formData).subscribe({
          next: () => {
            this.toastr.success('Categoría creada exitosamente', 'Éxito');
            this.loadCategorias();
            this.hideForm();
          },
          error: (error: any) => {
            console.error('Error al crear categoría:', error);
            this.toastr.error('Error al crear la categoría', 'Error');
            this.loading.set(false);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  deleteCategoria(categoria: Categoria): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${categoria.nombre}"?`)) {
      this.loading.set(true);
      this.categoriaService.deleteCategoria(categoria.categoriaId).subscribe({
        next: () => {
          this.toastr.success('Categoría eliminada exitosamente', 'Éxito');
          this.loadCategorias();
        },
        error: (error: any) => {
          console.error('Error al eliminar categoría:', error);
          this.toastr.error('Error al eliminar la categoría', 'Error');
          this.loading.set(false);
        }
      });
    }
  }

  toggleActiva(categoria: Categoria): void {
    const nuevoEstado = !categoria.activa;
    const categoriaActualizada = { ...categoria, activa: nuevoEstado };
    
    this.categoriaService.updateCategoria(categoria.categoriaId, categoriaActualizada).subscribe({
      next: () => {
        const mensaje = nuevoEstado ? 'Categoría activada' : 'Categoría desactivada';
        this.toastr.success(mensaje, 'Éxito');
        this.loadCategorias();
      },
      error: (error: any) => {
        console.error('Error al cambiar estado:', error);
        this.toastr.error('Error al cambiar el estado', 'Error');
      }
    });
  }

  hideForm(): void {
    this.showForm.set(false);
    this.editingCategory.set(null);
    this.categoriaForm.reset();
    this.loading.set(false);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoriaForm.controls).forEach(key => {
      const control = this.categoriaForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para el formulario
  get nombre() { return this.categoriaForm.get('nombre'); }
  get descripcion() { return this.categoriaForm.get('descripcion'); }
  get imagenUrl() { return this.categoriaForm.get('imagenUrl'); }
  get activa() { return this.categoriaForm.get('activa'); }
}

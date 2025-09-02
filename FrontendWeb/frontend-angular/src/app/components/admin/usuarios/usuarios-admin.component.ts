import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario, CreateUsuarioRequest } from '../../../models/models';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-admin.component.html',
  styleUrl: './usuarios-admin.component.css'
})
export class UsuariosAdminComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  loading = signal(false);
  showForm = signal(false);
  editingUser = signal<Usuario | null>(null);
  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toastr: ToastrService
  ) {
    this.usuarioForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      rol: ['Cliente', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading.set(true);
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios.set(usuarios);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.toastr.error('Error al cargar los usuarios', 'Error');
        this.loading.set(false);
      }
    });
  }

  showCreateForm(): void {
    this.editingUser.set(null);
    this.usuarioForm.reset();
    this.usuarioForm.patchValue({ rol: 'Cliente' });
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
  }

  editUsuario(usuario: Usuario): void {
    this.editingUser.set(usuario);
    this.usuarioForm.patchValue({
      nombreUsuario: usuario.nombreUsuario,
      email: usuario.email,
      rol: usuario.rol,
      password: ''
    });
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
  }

  onSubmit(): void {
    if (this.usuarioForm.valid && !this.loading()) {
      this.loading.set(true);
      
      const formData = this.usuarioForm.value;
      
      if (this.editingUser()) {
        // Actualizar usuario existente
        const updateData: any = {
          nombreUsuario: formData.nombreUsuario,
          email: formData.email,
          rol: formData.rol
        };
        
        if (formData.password && formData.password.trim()) {
          updateData.password = formData.password;
        }

        this.usuarioService.updateUsuario(this.editingUser()!.usuarioId, updateData).subscribe({
          next: () => {
            this.toastr.success('Usuario actualizado exitosamente', 'Éxito');
            this.loadUsuarios();
            this.hideForm();
          },
          error: (error: any) => {
            console.error('Error al actualizar usuario:', error);
            this.toastr.error('Error al actualizar el usuario', 'Error');
            this.loading.set(false);
          }
        });
      } else {
        // Crear nuevo usuario
        this.usuarioService.createUsuario(formData).subscribe({
          next: () => {
            this.toastr.success('Usuario creado exitosamente', 'Éxito');
            this.loadUsuarios();
            this.hideForm();
          },
          error: (error: any) => {
            console.error('Error al crear usuario:', error);
            const errorMessage = error.error?.message || 'Error al crear el usuario';
            this.toastr.error(errorMessage, 'Error');
            this.loading.set(false);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  deleteUsuario(usuario: Usuario): void {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${usuario.nombreUsuario}"?`)) {
      this.loading.set(true);
      this.usuarioService.deleteUsuario(usuario.usuarioId).subscribe({
        next: () => {
          this.toastr.success('Usuario eliminado exitosamente', 'Éxito');
          this.loadUsuarios();
        },
        error: (error: any) => {
          console.error('Error al eliminar usuario:', error);
          this.toastr.error('Error al eliminar el usuario', 'Error');
          this.loading.set(false);
        }
      });
    }
  }

  hideForm(): void {
    this.showForm.set(false);
    this.editingUser.set(null);
    this.usuarioForm.reset();
    this.loading.set(false);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  getRoleBadgeClass(rol: string): string {
    switch (rol) {
      case 'Admin': return 'badge bg-danger';
      case 'Empleado': return 'badge bg-warning text-dark';
      case 'Cliente': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  // Getters para el formulario
  get nombreUsuario() { return this.usuarioForm.get('nombreUsuario'); }
  get email() { return this.usuarioForm.get('email'); }
  get password() { return this.usuarioForm.get('password'); }
  get rol() { return this.usuarioForm.get('rol'); }
}

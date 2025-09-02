import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = signal(false);
  showLogin = signal(true);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['Cliente', [Validators.required]]
    });
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid && !this.loading()) {
      this.loading.set(true);
      
      const loginData = this.loginForm.value;
      
      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.toastr.success(`¡Bienvenido ${response.nombreUsuario}!`, 'Login exitoso');
          
          // Redirigir según el rol del usuario
          if (response.rol === 'Admin') {
            this.router.navigate(['/app/admin/dashboard']);
          } else {
            this.router.navigate(['/app/dashboard']);
          }
        },
        error: (error) => {
          this.loading.set(false);
          const errorMessage = error.error?.message || 'Error al iniciar sesión';
          this.toastr.error(errorMessage, 'Error');
        },
        complete: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid && !this.loading()) {
      this.loading.set(true);
      
      const registerData = this.registerForm.value;
      
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.toastr.success(`¡Bienvenido ${response.nombreUsuario}!`, 'Registro exitoso');
          
          // Redirigir según el rol del usuario
          if (response.rol === 'Admin') {
            this.router.navigate(['/app/admin/dashboard']);
          } else {
            this.router.navigate(['/app/dashboard']);
          }
        },
        error: (error) => {
          this.loading.set(false);
          const errorMessage = error.error?.message || 'Error al registrar usuario';
          this.toastr.error(errorMessage, 'Error');
        },
        complete: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  toggleForm(): void {
    this.showLogin.set(!this.showLogin());
    this.loginForm.reset();
    this.registerForm.reset();
    this.registerForm.patchValue({ rol: 'Cliente' });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  private markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for login form
  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }

  // Getters for register form
  get registerNombreUsuario() { return this.registerForm.get('nombreUsuario'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
  get registerRol() { return this.registerForm.get('rol'); }
}

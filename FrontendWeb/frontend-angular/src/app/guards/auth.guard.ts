import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    toastr.warning('Debes iniciar sesión para acceder a esta página', 'Acceso requerido');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  } else if (authService.isAuthenticated()) {
    toastr.error('No tienes permisos para acceder a esta página', 'Acceso denegado');
    router.navigate(['/dashboard']);
    return false;
  } else {
    toastr.warning('Debes iniciar sesión como administrador', 'Acceso requerido');
    router.navigate(['/login']);
    return false;
  }
};

export const employeeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    if (user?.rol === 'Admin' || user?.rol === 'Empleado') {
      return true;
    } else {
      toastr.error('No tienes permisos para acceder a esta página', 'Acceso denegado');
      router.navigate(['/dashboard']);
      return false;
    }
  } else {
    toastr.warning('Debes iniciar sesión como empleado', 'Acceso requerido');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    if (user?.rol === 'Cliente') {
      return true;
    } else {
      toastr.info('Esta funcionalidad es solo para clientes', 'Información');
      router.navigate(['/dashboard']);
      return false;
    }
  } else {
    toastr.warning('Debes iniciar sesión como cliente para hacer reservas', 'Acceso requerido');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser = computed(() => this.authService.getCurrentUser());

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si es admin, redirigir al dashboard administrativo
    if (this.isAdmin()) {
      this.router.navigate(['/app/admin/dashboard']);
      return;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isEmployee(): boolean {
    return this.currentUser()?.rol === 'Empleado';
  }

  isClient(): boolean {
    return this.currentUser()?.rol === 'Cliente';
  }
}

import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app-layout.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Restaurante Delicioso');
  
  // Señales reactivas para el estado de la aplicación
  currentUser = computed(() => this.authService.getCurrentUser());
  cartItemCount = signal(0);

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el carrito
    this.cartService.cartItems$.subscribe(items => {
      const count = items.reduce((total, item) => total + item.cantidad, 0);
      this.cartItemCount.set(count);
    });
  }

  logout(): void {
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}

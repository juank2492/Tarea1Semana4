import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { CartItem, CreatePedidoRequest } from '../../models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems = signal<CartItem[]>([]);
  total = computed(() => this.cartService.getCartTotal());
  itemCount = computed(() => this.cartService.getCartItemCount());
  processingOrder = signal(false);
  
  orderForm: FormGroup;
  showCheckoutForm = signal(false);

  constructor(
    private cartService: CartService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      observaciones: [''],
      direccionEntrega: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.cartItems$.subscribe(items => {
      this.cartItems.set(items);
    });
  }

  updateQuantity(productoId: number, cantidad: number): void {
    if (cantidad < 1) {
      this.removeItem(productoId);
      return;
    }
    this.cartService.updateQuantity(productoId, cantidad);
  }

  removeItem(productoId: number): void {
    this.cartService.removeFromCart(productoId);
    this.toastr.info('Producto eliminado del carrito', 'Carrito actualizado');
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.toastr.info('Carrito vaciado', 'Carrito actualizado');
  }

  toggleCheckoutForm(): void {
    this.showCheckoutForm.set(!this.showCheckoutForm());
  }

  processOrder(): void {
    if (!this.orderForm.valid || this.processingOrder() || this.cartItems().length === 0) {
      this.markFormGroupTouched();
      return;
    }

    this.processingOrder.set(true);

    const orderData: CreatePedidoRequest = {
      observaciones: this.orderForm.value.observaciones || '',
      direccionEntrega: this.orderForm.value.direccionEntrega,
      detallesPedido: this.cartItems().map(item => ({
        cantidad: item.cantidad,
        productoId: item.producto.productoId,
        observacionesItem: item.observaciones || ''
      }))
    };

    this.pedidoService.createPedido(orderData).subscribe({
      next: (pedido) => {
        this.cartService.clearCart();
        this.toastr.success(
          `Pedido #${pedido.pedidoId} creado exitosamente`, 
          'Pedido confirmado'
        );
        this.router.navigate(['/pedidos']);
      },
      error: (error) => {
        this.processingOrder.set(false);
        const errorMessage = error.error?.message || 'Error al procesar el pedido';
        this.toastr.error(errorMessage, 'Error');
      },
      complete: () => {
        this.processingOrder.set(false);
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/menu']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form controls
  get observaciones() { return this.orderForm.get('observaciones'); }
  get direccionEntrega() { return this.orderForm.get('direccionEntrega'); }
}

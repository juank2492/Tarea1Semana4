import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Producto } from '../models/models';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { afterNextRender } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Solo cargar el carrito en el navegador
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.loadCartFromStorage();
      });
    }
  }

  addToCart(producto: Producto, cantidad: number = 1, observaciones?: string): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(item => item.producto.productoId === producto.productoId);

    if (existingItem) {
      existingItem.cantidad += cantidad;
      if (observaciones) {
        existingItem.observaciones = observaciones;
      }
    } else {
      const newItem: CartItem = {
        producto,
        cantidad,
        observaciones
      };
      currentItems.push(newItem);
    }

    this.cartItemsSubject.next([...currentItems]);
    this.saveCartToStorage();
  }

  removeFromCart(productoId: number): void {
    const currentItems = this.cartItemsSubject.value.filter(
      item => item.producto.productoId !== productoId
    );
    this.cartItemsSubject.next(currentItems);
    this.saveCartToStorage();
  }

  updateQuantity(productoId: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.removeFromCart(productoId);
      return;
    }

    const currentItems = this.cartItemsSubject.value;
    const item = currentItems.find(item => item.producto.productoId === productoId);
    
    if (item) {
      item.cantidad = cantidad;
      this.cartItemsSubject.next([...currentItems]);
      this.saveCartToStorage();
    }
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.saveCartToStorage();
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  getCartItemCount(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  getCartTotal(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + (item.producto.precio * item.cantidad), 
      0
    );
  }

  private saveCartToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(this.cartItemsSubject.value));
    }
  }

  private loadCartFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart) as CartItem[];
          this.cartItemsSubject.next(items);
        } catch (error) {
          console.error('Error loading cart from storage:', error);
        }
      }
    }
  }
}

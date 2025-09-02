import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { Pedido, DetallePedido } from '../../models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  pedidos = signal<Pedido[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.pedidoService.getPedidos().subscribe({
      next: (pedidos: Pedido[]) => {
        // Filtrar pedidos del usuario actual
        const pedidosUsuario = pedidos.filter(p => p.usuarioId === currentUser.usuarioId);
        this.pedidos.set(pedidosUsuario);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
        this.error.set('Error al cargar los pedidos');
        this.loading.set(false);
        this.toastr.error('Error al cargar los pedidos', 'Error');
      }
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'badge bg-warning text-dark';
      case 'confirmado':
        return 'badge bg-info';
      case 'en preparacion':
      case 'enpreparacion':
        return 'badge bg-primary';
      case 'listo':
        return 'badge bg-success';
      case 'entregado':
        return 'badge bg-secondary';
      case 'cancelado':
        return 'badge bg-danger';
      default:
        return 'badge bg-light text-dark';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcularTotal(pedido: Pedido): number {
    return pedido.detallesPedido?.reduce((total: number, detalle: DetallePedido) => 
      total + (detalle.cantidad * detalle.precioUnitario), 0) || 0;
  }

  cancelarPedido(pedidoId: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      this.pedidoService.cancelarPedido(pedidoId).subscribe({
        next: () => {
          this.toastr.success('Pedido cancelado exitosamente', 'Éxito');
          this.cargarPedidos(); // Recargar la lista
        },
        error: (error: any) => {
          console.error('Error al cancelar pedido:', error);
          this.toastr.error('Error al cancelar el pedido', 'Error');
        }
      });
    }
  }

  puedeSerCancelado(estado: string): boolean {
    return ['pendiente', 'confirmado'].includes(estado.toLowerCase());
  }

  verDetalle(pedidoId: number): void {
    // Aquí podrías navegar a una página de detalle del pedido
    this.toastr.info('Funcionalidad de detalle en desarrollo', 'Info');
  }

  repetirPedido(pedido: Pedido): void {
    // Agregar todos los productos del pedido al carrito
    this.toastr.info('Funcionalidad de repetir pedido en desarrollo', 'Info');
  }
}

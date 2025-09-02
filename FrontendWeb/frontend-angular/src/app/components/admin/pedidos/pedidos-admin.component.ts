import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../models/models';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.css'
})
export class PedidosAdminComponent implements OnInit {
  pedidos = signal<Pedido[]>([]);
  loading = signal(false);
  selectedEstado = signal<string>('Todos');
  estadosDisponibles = ['Todos', 'Pendiente', 'EnPreparacion', 'Listo', 'Entregado', 'Cancelado'];

  constructor(
    private pedidoService: PedidoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading.set(true);
    this.pedidoService.getPedidos().subscribe({
      next: (pedidos: Pedido[]) => {
        this.pedidos.set(pedidos);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
        this.toastr.error('Error al cargar los pedidos', 'Error');
        this.loading.set(false);
      }
    });
  }

  get pedidosFiltrados(): Pedido[] {
    const estado = this.selectedEstado();
    if (estado === 'Todos') {
      return this.pedidos();
    }
    return this.pedidos().filter(pedido => pedido.estado === estado);
  }

  cambiarEstadoPedido(pedido: Pedido, nuevoEstado: string): void {
    if (pedido.pedidoId) {
      this.loading.set(true);
      this.pedidoService.cambiarEstadoPedido(pedido.pedidoId, nuevoEstado).subscribe({
        next: () => {
          this.toastr.success('Estado del pedido actualizado', 'Éxito');
          this.loadPedidos();
        },
        error: (error: any) => {
          console.error('Error al actualizar estado:', error);
          this.toastr.error('Error al actualizar el estado', 'Error');
          this.loading.set(false);
        }
      });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'badge bg-warning text-dark';
      case 'EnPreparacion': return 'badge bg-info';
      case 'Listo': return 'badge bg-success';
      case 'Entregado': return 'badge bg-primary';
      case 'Cancelado': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'EnPreparacion': return 'En Preparación';
      default: return estado;
    }
  }

  getNextStates(currentState: string): string[] {
    switch (currentState) {
      case 'Pendiente': return ['EnPreparacion', 'Cancelado'];
      case 'EnPreparacion': return ['Listo', 'Cancelado'];
      case 'Listo': return ['Entregado'];
      case 'Entregado': return [];
      case 'Cancelado': return [];
      default: return [];
    }
  }

  setFiltroEstado(estado: string): void {
    this.selectedEstado.set(estado);
  }

  getTotalPedido(pedido: Pedido): number {
    return pedido.detallesPedido?.reduce((total, detalle) => total + detalle.subtotal, 0) || pedido.total || 0;
  }
}

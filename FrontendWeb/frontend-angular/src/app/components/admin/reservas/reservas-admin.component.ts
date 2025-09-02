import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ReservaService } from '../../../services/reserva.service';
import { Reserva } from '../../../models/models';

@Component({
  selector: 'app-reservas-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas-admin.component.html',
  styleUrl: './reservas-admin.component.css'
})
export class ReservasAdminComponent implements OnInit {
  reservas = signal<Reserva[]>([]);
  loading = signal(false);
  selectedEstado = signal<string>('Todos');
  estadosDisponibles = ['Todos', 'Pendiente', 'Confirmada', 'Cancelada', 'Completada'];

  constructor(
    private reservaService: ReservaService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
  }

  loadReservas(): void {
    this.loading.set(true);
    this.reservaService.getReservas().subscribe({
      next: (reservas: Reserva[]) => {
        this.reservas.set(reservas);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar reservas:', error);
        this.toastr.error('Error al cargar las reservas', 'Error');
        this.loading.set(false);
      }
    });
  }

  get reservasFiltradas(): Reserva[] {
    const estado = this.selectedEstado();
    if (estado === 'Todos') {
      return this.reservas();
    }
    return this.reservas().filter(reserva => reserva.estado === estado);
  }

  cambiarEstadoReserva(reserva: Reserva, nuevoEstado: string): void {
    if (reserva.reservaId) {
      this.loading.set(true);
      this.reservaService.cambiarEstadoReserva(reserva.reservaId, nuevoEstado).subscribe({
        next: () => {
          this.toastr.success('Estado de la reserva actualizado', 'Éxito');
          this.loadReservas();
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
      case 'Confirmada': return 'badge bg-success';
      case 'Cancelada': return 'badge bg-danger';
      case 'Completada': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  getNextStates(currentState: string): string[] {
    switch (currentState) {
      case 'Pendiente': return ['Confirmada', 'Cancelada'];
      case 'Confirmada': return ['Completada', 'Cancelada'];
      case 'Completada': return [];
      case 'Cancelada': return [];
      default: return [];
    }
  }

  setFiltroEstado(estado: string): void {
    this.selectedEstado.set(estado);
  }
}

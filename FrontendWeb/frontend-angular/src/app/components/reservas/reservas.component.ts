import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Reserva } from '../../models/models';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent implements OnInit {
  reservas = signal<Reserva[]>([]);
  loading = signal(false);
  showForm = signal(false);
  reservaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.reservaForm = this.fb.group({
      fechaReserva: ['', [Validators.required]],
      horaReserva: ['', [Validators.required]],
      numeroPersonas: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      comentarios: ['']
    });
  }

  ngOnInit(): void {
    this.loadReservas();
  }

  loadReservas(): void {
    this.loading.set(true);
    this.reservaService.getMisReservas().subscribe({
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

  toggleForm(): void {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.reservaForm.reset();
    }
  }

  onSubmit(): void {
    if (this.reservaForm.valid && !this.loading()) {
      this.loading.set(true);
      
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.toastr.error('Usuario no encontrado', 'Error');
        this.loading.set(false);
        return;
      }

      const reservaData = {
        ...this.reservaForm.value,
        usuarioId: user.usuarioId,
        fechaReserva: new Date(this.reservaForm.value.fechaReserva + 'T' + this.reservaForm.value.horaReserva),
        estado: 'Pendiente'
      };

      this.reservaService.createReserva(reservaData).subscribe({
        next: (nuevaReserva: Reserva) => {
          this.toastr.success('Reserva creada exitosamente', 'Éxito');
          this.loadReservas();
          this.toggleForm();
          this.loading.set(false);
        },
        error: (error: any) => {
          console.error('Error al crear reserva:', error);
          this.toastr.error('Error al crear la reserva', 'Error');
          this.loading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  cancelarReserva(reservaId: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.loading.set(true);
      this.reservaService.cambiarEstadoReserva(reservaId, 'Cancelada').subscribe({
        next: () => {
          this.toastr.success('Reserva cancelada exitosamente', 'Éxito');
          this.loadReservas();
        },
        error: (error: any) => {
          console.error('Error al cancelar reserva:', error);
          this.toastr.error('Error al cancelar la reserva', 'Error');
          this.loading.set(false);
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reservaForm.controls).forEach(key => {
      const control = this.reservaForm.get(key);
      control?.markAsTouched();
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Confirmada': return 'badge bg-success';
      case 'Pendiente': return 'badge bg-warning text-dark';
      case 'Cancelada': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  // Getters para el formulario
  get fechaReserva() { return this.reservaForm.get('fechaReserva'); }
  get horaReserva() { return this.reservaForm.get('horaReserva'); }
  get numeroPersonas() { return this.reservaForm.get('numeroPersonas'); }
  get comentarios() { return this.reservaForm.get('comentarios'); }
}

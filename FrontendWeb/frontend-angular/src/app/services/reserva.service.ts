import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva, CreateReservaRequest, DisponibilidadHora } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) { }

  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/mis-reservas`);
  }

  getReserva(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

  createReserva(reserva: CreateReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva);
  }

  cambiarEstadoReserva(id: number, nuevoEstado: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/estado`, `"${nuevoEstado}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  cancelarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDisponibilidad(fecha: string): Observable<DisponibilidadHora[]> {
    return this.http.get<DisponibilidadHora[]>(`${this.apiUrl}/disponibilidad`, {
      params: { fecha }
    });
  }
}

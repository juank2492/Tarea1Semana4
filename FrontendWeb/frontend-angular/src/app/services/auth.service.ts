import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, Usuario } from '../models/models';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { afterNextRender } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // Usando configuración centralizada
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Solo cargar el usuario en el navegador
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.loadCurrentUser();
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'Admin';
  }

  isEmployee(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'Empleado' || user?.rol === 'Admin';
  }

  private setSession(authResponse: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', authResponse.token);
    }
    
    const user: Usuario = {
      usuarioId: 0, // Se extraerá del token
      nombreUsuario: authResponse.nombreUsuario,
      email: authResponse.email,
      rol: authResponse.rol,
      fechaRegistro: new Date().toISOString()
    };
    
    // Extraer el ID del usuario del token
    try {
      const payload = JSON.parse(atob(authResponse.token.split('.')[1]));
      user.usuarioId = parseInt(payload.nameid || payload.sub || '0');
    } catch (error) {
      console.error('Error parsing token:', error);
    }
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  private loadCurrentUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr && this.isAuthenticated()) {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      }
    }
  }
}

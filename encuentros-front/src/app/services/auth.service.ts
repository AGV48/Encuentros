import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EnvironmentService } from './environment.service';

export interface User {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  imagenPerfil?: string;
  fechaRegistro: Date;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {
    this.apiUrl = `${this.environmentService.getApiUrl()}/auth`;
    // Cargar usuario del localStorage al iniciar
    // Buscar en 'currentUser' (nuevo) o 'user' (legacy)
    const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }

  register(nombre: string, email: string, contrasena: string, apellido?: string, imagenPerfil?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      nombre,
      apellido,
      email,
      contrasena,
      imagenPerfil
    }).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  login(email: string, contrasena: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      contrasena
    }).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user'); // Limpiar también el legacy
    localStorage.removeItem('isLogged'); // Limpiar también el legacy
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  validateToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, {});
  }

  private handleAuthentication(response: AuthResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    // Mantener compatibilidad con código existente
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('isLogged', 'true');
    this.currentUserSubject.next(response.user);
  }
}

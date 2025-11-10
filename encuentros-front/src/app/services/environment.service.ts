import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private readonly apiUrl: string;

  constructor() {
    // Detectar si estamos en producción (Docker) o desarrollo local
    // En Docker, el backend está en el mismo host pero en el puerto 3000
    // En desarrollo local, usamos localhost:3000
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Desarrollo local
      this.apiUrl = 'http://localhost:3000';
    } else {
      // Producción (Docker) - el frontend y backend están en el mismo host
      // pero el backend está en el puerto 3000
      this.apiUrl = `http://${hostname}:3000`;
    }
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}

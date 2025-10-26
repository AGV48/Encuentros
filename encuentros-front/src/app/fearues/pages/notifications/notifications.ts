import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notifications',
  imports: [RouterLink, NgIf, NgFor],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications {
  http = inject(HttpClient);
  notifications: Array<any> = [];
  accepted: Array<any> = [];
  loading = false;
  currentUserId: number | null = null;

  constructor() {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { const u = JSON.parse(stored as string); if (u && u.id) this.currentUserId = u.id; } catch (e) { }
    }
    if (this.currentUserId) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    if (!this.currentUserId) return;
    this.loading = true;
    this.http.get<any>(`http://localhost:3000/users/notifications?userId=${this.currentUserId}`).subscribe({
      next: res => {
        // backend devuelve { pending: [...], accepted: [...] }
        this.notifications = (res && Array.isArray(res.pending)) ? res.pending : [];
        this.accepted = (res && Array.isArray(res.accepted)) ? res.accepted : [];
        this.loading = false;
      },
      error: err => { this.loading = false; console.error(err); Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar notificaciones' }); }
    });
  }

  accept(id_relacion: number) {
    if (!this.currentUserId) {
      Swal.fire({ icon: 'warning', title: 'No autorizado', text: 'Inicia sesión' });
      return;
    }
    this.http.post('http://localhost:3000/users/accept-request', { id_relacion_amistad: id_relacion, userId: this.currentUserId }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Solicitud aceptada' });
        // remover notificación aceptada (admitir distintos nombres de propiedad según driver)
        this.notifications = this.notifications.filter(n => !(n.id_relacion === id_relacion || n.ID_RELACION === id_relacion || n.id_relacion_amistad === id_relacion));
        this.loadNotifications();
      },
      error: err => {
        console.error(err);
        const msg = err && err.error ? (err.error.message || JSON.stringify(err.error)) : 'Error aceptando solicitud';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    });
  }

  reject(id_relacion: number) {
    if (!this.currentUserId) {
      Swal.fire({ icon: 'warning', title: 'No autorizado', text: 'Inicia sesión' });
      return;
    }
    this.http.post('http://localhost:3000/users/reject-request', { id_relacion_amistad: id_relacion, userId: this.currentUserId }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Solicitud rechazada' });
        // remover notificación rechazada
        this.notifications = this.notifications.filter(n => !(n.id_relacion === id_relacion || n.ID_RELACION === id_relacion || n.id_relacion_amistad === id_relacion));
        this.loadNotifications();
      },
      error: err => {
        console.error(err);
        const msg = err && err.error ? (err.error.message || JSON.stringify(err.error)) : 'Error rechazando solicitud';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    });
  }
}

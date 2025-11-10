import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { EnvironmentService } from '../../../services/environment.service';

@Component({
  selector: 'app-search',
  imports: [NgFor, NgIf, RouterLink, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  http = inject(HttpClient);
  env = inject(EnvironmentService);
  apiUrl = this.env.getApiUrl();
  searchTerm = '';
  results: Array<any> = [];
  loading = false;
  error = false;
  errorMsg = '';
  currentUserId: number | null = null;
  requestsSent = new Set<number>();
  private searchTimer: any = null;

  constructor() {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored as string);
        if (u && u.id) this.currentUserId = u.id;
      } catch (e) {
        console.warn('Error parseando user desde localStorage', e);
      }
    }
  }

  doSearch() {
    const term = (this.searchTerm || '').trim();
    if (!term) { this.results = []; this.error = false; return; }
    // debounce to avoid firing request on every keystroke
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.loading = true;
      this.error = false;
      this.errorMsg = '';
      const q = encodeURIComponent(term);
  // Include currentUser so backend can annotate results with friendship/pending flags
  const currentParam = this.currentUserId ? `&currentUser=${this.currentUserId}` : '';
  this.http.get<any>(`${this.apiUrl}/users/search_user?q=${q}${currentParam}`).subscribe({
        next: res => {
          if (Array.isArray(res)) {
            this.results = res;
          } else if (res && Array.isArray(res.results)) {
            this.results = res.results;
          } else if (res && Array.isArray(res.results)) {
            this.results = res.results;
          } else {
            this.results = [];
          }
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.results = [];
          this.error = true;
          this.errorMsg = 'Error buscando usuarios. Intenta más tarde.';
          console.error('Search error', err);
          // do not show Swal on every keystroke; reserve Swal for explicit actions
        }
      });
    }, 350);
  }

  sendRequest(toId: number) {
    if (!this.currentUserId) {
      Swal.fire({ icon: 'warning', title: 'No autorizado', text: 'Inicia sesión para enviar solicitudes' });
      return;
    }
    if (toId === this.currentUserId) return;
    // prevent duplicate sends: check local requested set or annotated pending flag
    if (this.requestsSent.has(toId)) {
      Swal.fire({ icon: 'info', title: 'Solicitud pendiente', text: 'Ya se está enviando una solicitud a este usuario.' });
      return;
    }
    const u = this.results.find(r => ((r.id ?? r.ID_USUARIO) === toId));
    if (u && (u as any).pendingRequestFromMe) {
      Swal.fire({ icon: 'info', title: 'Solicitud ya enviada', text: 'Ya le has enviado una solicitud a este usuario.' });
      return;
    }
    // prevent sending if already friends or if other already sent a request to me
    if (u && (u as any).isFriend) {
      Swal.fire({ icon: 'info', title: 'Ya son amigos', text: 'Ya eres amigo de este usuario.' });
      return;
    }
    if (u && (u as any).pendingRequestToMe) {
      Swal.fire({ icon: 'info', title: 'Solicitud pendiente', text: 'Este usuario te ha enviado una solicitud; revisa tus notificaciones.' });
      return;
    }
    this.requestsSent.add(toId);
    const payload = { from: this.currentUserId, to: toId };
    this.http.post('${this.apiUrl}/users/friend-request', payload).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Solicitud enviada' });
        // actualizar resultado local para reflejar que se envió la solicitud
        if (u) (u as any).pendingRequestFromMe = true;
        this.requestsSent.delete(toId);
      },
      error: (e) => {
        console.error('Error sending friend request', e);
        // intentar extraer un mensaje amigable devuelto por el backend
        const msg = (e && e.error && (e.error.message || e.error)) || e.message || 'No se pudo enviar la solicitud';
        Swal.fire({ icon: 'error', title: 'Error', text: String(msg) });
        this.requestsSent.delete(toId);
      }
    });
  }
}

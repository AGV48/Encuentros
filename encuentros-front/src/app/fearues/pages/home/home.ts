import { NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  router = inject(Router);
  http = inject(HttpClient);
  month: string;
  days: number[] = [];
  showCreate = false;
  currentUserId: number | null = null;
  currentMonthIndex: number | null = null;
  currentYear: number | null = null;

  // lista de encuentros traídos del backend
  encuentros: Array<{
    id: number;
    idCreador?: number;
    titulo: string;
    descripcion?: string;
    lugar: string;
    fecha: string | Date | null;
    fechaCreacion?: string | Date | null;
    displayWhen?: string;
    // Campos adicionales: solo presupuesto y participantes
    idPresupuesto?: number | null;
    presupuestoTotal?: number;
    cantParticipantes?: number;
  }> = [];

  // métricas
  encuentrosHoy = 0;
  encuentrosMes = 0;
  encuentrosPendientes = 0;
  upcoming: typeof this.encuentros = [];
  // días del mes que tienen encuentros (números de día)
  daysWithEncuentros: Set<number> = new Set();

  // modelo simple para el formulario de creación
  newEncuentro: {
    idCreador?: number | null;
    titulo: string;
    descripcion: string;
    lugar: string;
    fecha: string;
  } = {
    idCreador: null,
    titulo: '',
    descripcion: '',
    lugar: '',
    fecha: '',
  };

  creating = false;

  constructor() {
    const stored = localStorage.getItem('user');
    console.log('User from localStorage:', stored); // Debug
    if (stored) {
      try {
        const user = JSON.parse(stored);
        console.log('Parsed user:', user); // Debug
        // si el usuario tiene id, prellenarlo como idCreador
        if (user && user.id) {
          this.newEncuentro.idCreador = user.id;
          this.currentUserId = user.id;
          console.log('User ID set:', this.currentUserId); // Debug
        } else {
          console.warn('User object exists but has no id property:', user);
        }
      } catch (e) {
        console.error('Error parseando user desde localStorage', e);
      }
    } else {
      console.warn('No user found in localStorage');
      // Si no hay usuario, redirigir al login
      const userLogged = localStorage.getItem('isLogged');
      if (!userLogged || userLogged !== 'true') {
        this.router.navigate(['/']);
      }
    }

    const today = new Date();
    const year = today.getFullYear();
    const monthIndex = today.getMonth();
    this.currentYear = year;
    this.currentMonthIndex = monthIndex;
    this.month = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    this.days = Array.from({ length: lastDay }, (_, i) => i + 1);
    // carga inicial de encuentros para el usuario
    if (this.currentUserId) {
      this.loadEncuentros();
    }
  }
  toggleCreate() {
    this.showCreate = !this.showCreate;
  }

  createEncuentro() {
    if (this.creating) return;
    // Validaciones mínimas
    if (
      !this.newEncuentro.titulo ||
      !this.newEncuentro.descripcion ||
      !this.newEncuentro.lugar ||
      !this.newEncuentro.fecha
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
      });
      return;
    }

    // Validar que la fecha no sea pasada
    const selectedDate = new Date(this.newEncuentro.fecha);
    if (selectedDate.getTime() < Date.now()) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'La fecha del encuentro no puede ser en el pasado',
      });
      return;
    }

    const payload: any = {
      idCreador: this.newEncuentro.idCreador,
      titulo: this.newEncuentro.titulo,
      descripcion: this.newEncuentro.descripcion,
      lugar: this.newEncuentro.lugar,
      fecha: new Date(this.newEncuentro.fecha),
    };

    this.creating = true;
    this.http.post('http://localhost:3000/encuentro', payload, { responseType: 'json' }).subscribe({
      next: (res: any) => {
        this.creating = false;
        this.showCreate = false;

        // limpiar formulario
        this.newEncuentro.titulo = '';
        this.newEncuentro.descripcion = '';
        this.newEncuentro.lugar = '';
        this.newEncuentro.fecha = '';
        Swal.fire({
          icon: 'success',
          title: 'Encuentro creado',
          text: 'El encuentro ha sido creado correctamente y está disponible en Chats',
        });
        // refrescar lista de encuentros
        if (this.currentUserId) this.loadEncuentros();
      },
      error: (err) => {
        this.creating = false;
        console.error('Error creando encuentro', err);
        Swal.fire({
          icon: 'error',
          title: 'Error creando encuentro',
          text: 'Hubo un error al crear el encuentro.',
        });
      },
    });
  }

  loadEncuentros() {
    if (!this.currentUserId) {
      console.error('No currentUserId available for loading encuentros');
      return;
    }
    console.log('Loading encuentros for userId:', this.currentUserId);
    this.http
      .get<any[]>(`http://localhost:3000/encuentro/resumen?creador=${this.currentUserId}`)
      .subscribe({
        next: (res) => {
          console.log('Encuentros received from API:', res);
          // normalizar fechas y asignar
          this.encuentros = res.map((r) => {
            const fechaObj = r.fecha ? new Date(r.fecha) : null;
            // construir etiqueta legible para la lista
            let displayWhen = '';
            if (fechaObj) {
              const now = new Date();
              const isToday =
                fechaObj.getFullYear() === now.getFullYear() &&
                fechaObj.getMonth() === now.getMonth() &&
                fechaObj.getDate() === now.getDate();
              const timeStr = fechaObj.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              if (isToday) {
                displayWhen = `Hoy • ${timeStr} • ${r.lugar || ''}`;
              } else {
                const dayMonth = fechaObj.toLocaleDateString([], {
                  day: 'numeric',
                  month: 'short',
                });
                displayWhen = `${dayMonth} • ${timeStr} • ${r.lugar || ''}`;
              }
            }
            return {
              id: r.idEncuentro || r.id,
              idCreador: r.idCreador,
              titulo: r.titulo,
              descripcion: r.descripcion,
              lugar: r.lugar,
              fecha: fechaObj,
              fechaCreacion: r.fechaCreacion ? new Date(r.fechaCreacion) : null,
              displayWhen,
              // Solo presupuesto y participantes
              idPresupuesto: r.idPresupuesto,
              presupuestoTotal: r.presupuestoTotal || 0,
              cantParticipantes: r.cantParticipantes || 0,
            };
          });
          console.log('Processed encuentros:', this.encuentros);
          this.computeMetrics();
        },
        error: (err) => {
          console.error('Error cargando encuentros', err);
        },
      });
  }

  computeMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    this.encuentrosHoy = this.encuentros.filter(
      (e) => e.fecha && new Date(e.fecha) >= todayStart && new Date(e.fecha) < todayEnd
    ).length;

    this.encuentrosMes = this.encuentros.filter((e) => {
      if (!e.fecha) return false;
      const d = new Date(e.fecha);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    this.encuentrosPendientes = this.encuentros.filter(
      (e) => e.fecha && new Date(e.fecha) > now
    ).length;

    // upcoming: próximos encuentros (futuros) ordenados
    this.upcoming = this.encuentros
      .filter((e) => e.fecha && new Date(e.fecha) >= now)
      .sort((a, b) => {
        const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
        const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 6);

    // calcular días con encuentros para el mes actualmente mostrado
    this.computeDaysWithEncuentros();
  }

  computeDaysWithEncuentros() {
    this.daysWithEncuentros.clear();
    if (this.currentYear === null || this.currentMonthIndex === null) return;
    for (const e of this.encuentros) {
      if (!e.fecha) continue;
      const d = new Date(e.fecha);
      if (d.getFullYear() === this.currentYear && d.getMonth() === this.currentMonthIndex) {
        this.daysWithEncuentros.add(d.getDate());
      }
    }
  }
}

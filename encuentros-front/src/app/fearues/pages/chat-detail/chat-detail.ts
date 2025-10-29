import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-detail.html',
  styleUrl: './chat-detail.css',
})
export class ChatDetail implements OnInit {
  http = inject(HttpClient);
  encuentroId: string | null = null;
  encuentro: any = null;
  messageText: string = '';
  showAddFriends: boolean = false;
  showEncuentroDetails: boolean = false;
  showParticipantes: boolean = false;
  currentUserId: number | null = null;
  friends: Array<any> = [];
  loadingFriends: boolean = false;
  participantes: Array<any> = [];
  participantesDetalle: Array<{
    idEncuentro: number;
    tituloEncuentro: string;
    fecha: Date;
    idUsuario: number;
    nombreCompleto: string;
    rol: string;
  }> = [];
  participantesAportes: Array<{
    idEncuentro: number;
    nombreEncuentro: string;
    idUsuario: number;
    nombreUsuario: string;
    apellidoUsuario: string;
    nombreCompleto: string;
    rol: string;
    totalAportes: number;
  }> = [];

  constructor(private route: ActivatedRoute, private router: Router) {
    // Obtener el usuario actual
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.id) {
          this.currentUserId = user.id;
        }
      } catch (e) {
        console.warn('Error parseando user desde localStorage', e);
      }
    }
  }

  ngOnInit() {
    // Obtener el ID del encuentro de los parámetros de la ruta
    this.encuentroId = this.route.snapshot.paramMap.get('id');

    if (this.encuentroId) {
      this.loadEncuentro();
      this.loadParticipantes();
    } else {
      // Si no hay ID, redirigir a chats
      this.router.navigate(['/chats']);
    }
  }

  loadEncuentro() {
    if (!this.encuentroId) return;

    // Cargar el encuentro desde el backend
    this.http.get<any>(`http://localhost:3000/encuentro/${this.encuentroId}`).subscribe({
      next: (encuentro) => {
        if (encuentro) {
          this.encuentro = encuentro;
        } else {
          // Si no se encuentra el encuentro, redirigir
          this.router.navigate(['/chats']);
        }
      },
      error: (err) => {
        console.error('Error cargando encuentro', err);
        this.router.navigate(['/chats']);
      },
    });
  }

  loadParticipantes() {
    if (!this.encuentroId) return;

    // Cargar participantes básicos (para compatibilidad)
    this.http
      .get<any[]>(`http://localhost:3000/participantes-encuentro?encuentro=${this.encuentroId}`)
      .subscribe({
        next: (participantes) => {
          this.participantes = participantes;
        },
        error: (err) => {
          console.error('Error cargando participantes', err);
        },
      });
    
    // Cargar participantes desde la vista con información detallada
    this.http
      .get<any[]>(`http://localhost:3000/participantes-encuentro/vista/detalle?encuentro=${this.encuentroId}`)
      .subscribe({
        next: (participantes) => {
          this.participantesDetalle = participantes;
          console.log('Participantes detalle:', this.participantesDetalle);
        },
        error: (err) => {
          console.error('Error cargando participantes detalle', err);
        },
      });
    
    // Cargar participantes con aportes desde la vista VISTAPARTICIPANTESAPORTES
    this.http
      .get<any[]>(`http://localhost:3000/participantes-encuentro/aportes/resumen?encuentro=${this.encuentroId}`)
      .subscribe({
        next: (aportes) => {
          this.participantesAportes = aportes;
          console.log('Participantes con aportes:', this.participantesAportes);
        },
        error: (err) => {
          console.error('Error cargando aportes de participantes', err);
        },
      });
  }

  sendMessage() {
    // Simulación: no se envía realmente el mensaje
    if (this.messageText.trim()) {
      console.log('Mensaje simulado:', this.messageText);
      this.messageText = '';
    }
  }

  goBack() {
    this.router.navigate(['/chats']);
  }

  toggleAddFriends() {
    this.showAddFriends = !this.showAddFriends;

    if (this.showAddFriends && this.friends.length === 0) {
      this.loadFriends();
    }
  }

  loadFriends() {
    if (!this.currentUserId) {
      console.warn('No hay usuario logueado');
      return;
    }

    this.loadingFriends = true;
    this.http
      .get<any>(
        `http://localhost:3000/users/friends/${this.currentUserId}?userId=${this.currentUserId}`
      )
      .subscribe({
        next: (response) => {
          this.loadingFriends = false;
          console.log('Respuesta de amigos:', response); // Debug
          if (response.success && response.friends) {
            // Normalizar nombres de propiedades (Oracle devuelve en mayúsculas o minúsculas según el alias)
            this.friends = response.friends.map((friend: any) => {
              const normalizedFriend = {
                id: friend.id || friend.ID || friend.ID_USUARIO,
                nombre: friend.nombre || friend.NOMBRE,
                apellido: friend.apellido || friend.APELLIDO,
                email: friend.email || friend.EMAIL,
                imagenPerfil: friend.imagenPerfil || friend.IMAGEN_PERFIL || friend.IMAGENPERFIL,
                isParticipante: this.participantes.some(
                  (p) => p.idUsuario === (friend.id || friend.ID || friend.ID_USUARIO)
                ),
              };
              console.log('Amigo normalizado:', normalizedFriend); // Debug
              return normalizedFriend;
            });
            console.log('Lista final de amigos:', this.friends); // Debug
          }
        },
        error: (err) => {
          this.loadingFriends = false;
          console.error('Error cargando amigos', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los amigos',
          });
        },
      });
  }

  addParticipante(friend: any) {
    if (!this.encuentroId) return;

    const payload = {
      idEncuentro: Number(this.encuentroId),
      idUsuario: friend.id,
      idSolicitante: this.currentUserId, // Usuario que está haciendo la solicitud
      rol: 'participante',
    };

    this.http.post('http://localhost:3000/participantes-encuentro', payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: `${friend.nombre} ha sido agregado al encuentro`,
          timer: 2000,
          showConfirmButton: false,
        });

        // Marcar como participante en la lista
        friend.isParticipante = true;

        // Recargar participantes
        this.loadParticipantes();
      },
      error: (err) => {
        console.error('Error agregando participante', err);
        const errorMsg = err.error?.message || 'No se pudo agregar al participante';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
      },
    });
  }

  toggleEncuentroDetails() {
    this.showEncuentroDetails = !this.showEncuentroDetails;
  }

  toggleParticipantes() {
    this.showParticipantes = !this.showParticipantes;
  }

  goToBudgets() {
    this.router.navigate(['/budgets', this.encuentroId]);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getAporteByUsuario(idUsuario: number): number | null {
    const participante = this.participantesAportes.find(p => p.idUsuario === idUsuario);
    return participante ? participante.totalAportes : null;
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-detail.html',
  styleUrl: './chat-detail.css'
})
export class ChatDetail implements OnInit {
  http = inject(HttpClient);
  encuentroId: string | null = null;
  encuentro: any = null;
  messageText: string = '';
  showAddFriends: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el ID del encuentro de los parámetros de la ruta
    this.encuentroId = this.route.snapshot.paramMap.get('id');
    
    if (this.encuentroId) {
      this.loadEncuentro();
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
      }
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
  }

  addFriend() {
    // Función para agregar amigos (placeholder)
    alert('Funcionalidad de agregar amigos - Por implementar');
    this.showAddFriends = false;
  }
}

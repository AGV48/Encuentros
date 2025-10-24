import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chats',
  imports: [RouterLink],
  templateUrl: './chats.html',
  styleUrl: './chats.css'
})
export class Chats {
  constructor() {
    // let userLogged = localStorage.getItem('isLogged');
    // if (!userLogged || userLogged !== 'true') {
    //   window.location.href = '/';
    // }
  }
}

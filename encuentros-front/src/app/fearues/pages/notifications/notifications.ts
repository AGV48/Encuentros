import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications',
  imports: [RouterLink],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications {
  constructor() {
    // let userLogged = localStorage.getItem('isLogged');
    // if (!userLogged || userLogged !== 'true') {
    //   window.location.href = '/';
    // }
  }
}

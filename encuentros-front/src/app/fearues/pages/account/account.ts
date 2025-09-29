import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account {
  router = inject(Router)

  constructor() {
    let userLogged = localStorage.getItem('isLogged');
    if (!userLogged || userLogged !== 'true') {
      this.router.navigate(['/']);
    }
  }

  onLogout() {
    localStorage.setItem('isLogged', 'false');
    this.router.navigate(['/']);
  }
}

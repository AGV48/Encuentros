import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [NgFor, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  month: string;
  days: number[] = [];

  constructor() {
    let userLogged = localStorage.getItem('isLogged');
    if (!userLogged || userLogged !== 'true') {
      window.location.href = '/';
    }
    const today = new Date();
    const year = today.getFullYear();
    const monthIndex = today.getMonth(); 

    this.month = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    this.days = Array.from({ length: lastDay }, (_, i) => i + 1);
  }
}

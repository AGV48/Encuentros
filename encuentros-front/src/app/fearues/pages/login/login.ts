import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  fb = inject(FormBuilder);
  router = inject(Router);
  http = inject(HttpClient);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  onLogin() {
    if (this.loginForm.valid) {
      const userLogin = this.loginForm.value;

      this.http.post<any>('http://localhost:3000/users/login', {
        email: userLogin.email,
        contrasena: userLogin.password
      }).subscribe({
        next: (res) => {
          if (res.success) {
            localStorage.setItem('isLogged', 'true');
            localStorage.setItem('user', JSON.stringify(res.user));
            this.router.navigate(['/home']);
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.message });
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar al servidor' });
        }
      });
    }
  }
}

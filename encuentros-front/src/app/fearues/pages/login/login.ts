import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  onLogin() {
    if (this.loginForm.valid) {
      const userLogin = this.loginForm.value;

      this.authService
        .login(userLogin.email!, userLogin.password!)
        .subscribe({
          next: (res) => {
            console.log('Login exitoso:', res);
            console.log('Token guardado:', localStorage.getItem('access_token'));
            console.log('Usuario guardado:', localStorage.getItem('currentUser'));
            
            Swal.fire({
              icon: 'success',
              title: '¡Bienvenido!',
              text: `Hola ${res.user.nombre}`,
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              // Navegar después de cerrar el alert
              this.router.navigate(['/home']);
            });
          },
          error: (err) => {
            console.error('Login error:', err);
            const errorMessage = err.error?.message || 'Credenciales inválidas';
            Swal.fire({
              icon: 'error',
              title: 'Error al iniciar sesión',
              text: errorMessage
            });
          },
        });
    }
  }
}

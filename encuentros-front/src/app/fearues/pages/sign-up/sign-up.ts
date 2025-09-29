import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // 👈 importar HttpClient
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule], // 👈 quitar HttpClientModule
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp {
  fb = inject(FormBuilder);
  route = inject(Router);
  http = inject(HttpClient); // 👈 inyectar

  signUpForm = this.fb.group({
    nombre: ['', [Validators.required]],   // 👈 igual al backend
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });


  onSignUp() {
    if (this.signUpForm.valid) {
      const user = this.signUpForm.value;

      this.http.post('http://localhost:3000/users', user).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Cuenta creada', text: 'Tu cuenta ha sido creada exitosamente' });
          this.route.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al crear tu cuenta' });
        }
      });
    }
  }
}
  
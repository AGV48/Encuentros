import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUp {
  fb = inject(FormBuilder);
  route = inject(Router);
  http = inject(HttpClient);

  signUpForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });


  onSignUp() {
    if (this.signUpForm.valid) {
      const value = this.signUpForm.value as any;

      // Verificar confirmación de contraseña en el cliente
      if (value.contrasena !== value.confirmPassword) {
        Swal.fire({ icon: 'warning', title: 'Contraseñas no coinciden', text: 'Por favor verifica las contraseñas' });
        return;
      }

      const payload = {
        nombre: value.nombre,
        apellido: value.apellido,
        email: value.email,
        contrasena: value.contrasena
      };

      this.http.post('http://localhost:3000/users', payload).subscribe({
        next: (response: any) => {
          // Guardar usuario en localStorage y marcar sesión como iniciada
          try {
            localStorage.setItem('user', JSON.stringify(response));
            localStorage.setItem('isLogged', 'true');
          } catch (e) {
            console.warn('No se pudo guardar en localStorage', e);
          }

          Swal.fire({ icon: 'success', title: 'Cuenta creada', text: 'Tu cuenta ha sido creada exitosamente' });
          // Redirigir directamente a la pantalla de cuenta para ver/editar perfil
          this.route.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message || 'Hubo un problema al crear tu cuenta';
          Swal.fire({ icon: 'error', title: 'Error', text: msg });
        }
      });
    }
  }
}
  
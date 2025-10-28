import { CurrencyPipe, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface BudgetDetails {
  id?: number;
  nombre: string;
  monto: number;
  idEncuentro?: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './budgets.html',
  styleUrl: './budgets.css',
})
export class Budgets implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  encuentroId: string | null = null;
  submitting = false;
  errorMessage: string | null = null;
  budget: BudgetDetails | null = null;
  loading = true;

  budgetForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(200)]],
    monto: ['', [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit() {
    // Obtener el ID del encuentro de los parámetros de la ruta
    this.encuentroId = this.route.snapshot.paramMap.get('id');

    if (this.encuentroId) {
      this.loadPresupuesto();
    } else {
      this.loading = false;
      Swal.fire({
        icon: 'warning',
        title: 'Sin encuentro',
        text: 'No se especificó un encuentro para el presupuesto',
      });
    }
  }

  loadPresupuesto() {
    if (!this.encuentroId) return;

    this.loading = true;
    this.http
      .get<any>(`http://localhost:3000/presupuesto?encuentro=${this.encuentroId}`)
      .subscribe({
        next: (presupuesto) => {
          this.loading = false;
          if (presupuesto) {
            this.budget = {
              id: presupuesto.id,
              nombre: presupuesto.nombreItem,
              monto: presupuesto.montoItem,
              idEncuentro: presupuesto.idEncuentro,
            };
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error cargando presupuesto', err);
          // No mostrar error si simplemente no existe, es válido no tener presupuesto aún
        },
      });
  }

  get nombreControl() {
    return this.budgetForm.get('nombre');
  }

  get montoControl() {
    return this.budgetForm.get('monto');
  }

  onCreateBudget(): void {
    if (this.submitting || this.budgetForm.invalid || !this.encuentroId) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const { nombre, monto } = this.budgetForm.value;
    const parsedAmount = Number(monto);

    const payload = {
      idEncuentro: Number(this.encuentroId),
      nombreItem: (nombre ?? '').trim(),
      montoItem: Number.isFinite(parsedAmount) ? parsedAmount : 0,
    };

    this.http.post<any>('http://localhost:3000/presupuesto', payload).subscribe({
      next: (presupuesto) => {
        this.submitting = false;
        this.budget = {
          id: presupuesto.id,
          nombre: presupuesto.nombreItem,
          monto: presupuesto.montoItem,
          idEncuentro: presupuesto.idEncuentro,
        };

        Swal.fire({
          icon: 'success',
          title: '¡Presupuesto creado!',
          text: 'El presupuesto ha sido creado exitosamente',
          timer: 2000,
          showConfirmButton: false,
        });

        this.router.navigate(['/pockets', this.encuentroId]);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error creando presupuesto', err);
        const errorMsg = err.error?.message || 'Error al crear el presupuesto';

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
      },
    });
  }

  goToPockets(): void {
    this.router.navigate(['/pockets', this.encuentroId]);
  }
}

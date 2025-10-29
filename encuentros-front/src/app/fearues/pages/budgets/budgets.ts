import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface ItemPresupuesto {
  id: number;
  nombreItem: string;
  montoItem: number;
}

interface BudgetDetails {
  id?: number;
  presupuestoTotal: number;
  idEncuentro?: number;
  items?: ItemPresupuesto[];
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, ReactiveFormsModule, CurrencyPipe],
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
  addingItem = false;

  itemForm = this.fb.group({
    nombreItem: ['', [Validators.required, Validators.maxLength(200)]],
    montoItem: ['', [Validators.required, Validators.min(0.01)]],
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
          // Si existe el presupuesto (aunque sea solo con id), mostrarlo
          if (presupuesto && presupuesto.id) {
            this.budget = {
              id: presupuesto.id,
              presupuestoTotal: presupuesto.presupuestoTotal || 0,
              idEncuentro: presupuesto.idEncuentro,
              items: presupuesto.items || [],
            };
            console.log('Presupuesto cargado:', this.budget);
          } else {
            console.log('No se encontró presupuesto para este encuentro');
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error cargando presupuesto', err);
          // No mostrar error si simplemente no existe, es válido no tener presupuesto aún
        },
      });
  }

  get nombreItemControl() {
    return this.itemForm.get('nombreItem');
  }

  get montoItemControl() {
    return this.itemForm.get('montoItem');
  }

  onAddItem(): void {
    if (this.addingItem || this.itemForm.invalid || !this.budget?.id || !this.encuentroId) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.addingItem = true;
    const { nombreItem, montoItem } = this.itemForm.value;

    const payload = {
      idPresupuesto: this.budget.id,
      idEncuentro: Number(this.encuentroId),
      nombreItem: (nombreItem ?? '').trim(),
      montoItem: Number(montoItem),
    };

    this.http.post<any>('http://localhost:3000/presupuesto/item', payload).subscribe({
      next: (item) => {
        this.addingItem = false;
        
        // Agregar el item a la lista
        if (this.budget) {
          if (!this.budget.items) {
            this.budget.items = [];
          }
          this.budget.items.push(item);
          this.budget.presupuestoTotal += item.montoItem;
        }

        // Limpiar el formulario
        this.itemForm.reset();

        Swal.fire({
          icon: 'success',
          title: 'Item agregado',
          text: 'El item ha sido agregado al presupuesto',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        this.addingItem = false;
        console.error('Error agregando item', err);
        const errorMsg = err.error?.message || 'Error al agregar el item';

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

  goToEncuentro(): void {
    this.router.navigate(['/chat-detail', this.encuentroId]);
  }
}

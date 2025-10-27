import { CurrencyPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface BudgetDetails {
  nombre: string;
  monto: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './budgets.html',
  styleUrl: './budgets.css',
})
export class Budgets {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  private readonly storageKey = 'encuentros:selected-budget';

  submitting = false;
  errorMessage: string | null = null;
  budget: BudgetDetails | null = null;

  budgetForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(200)]],
    monto: ['', [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    this.loadBudgetFromStorage();
  }

  get nombreControl() {
    return this.budgetForm.get('nombre');
  }

  get montoControl() {
    return this.budgetForm.get('monto');
  }

  onCreateBudget(): void {
    if (this.submitting || this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const { nombre, monto } = this.budgetForm.value;
    const parsedAmount = Number(monto);

    const newBudget: BudgetDetails = {
      nombre: (nombre ?? '').trim(),
      monto: Number.isFinite(parsedAmount) ? parsedAmount : 0,
    };

    this.budget = newBudget;
    this.persistBudget(newBudget);
    this.submitting = false;
    this.router.navigate(['/pockets']);
  }

  goToPockets(): void {
    this.router.navigate(['/pockets']);
  }

  private loadBudgetFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const stored = JSON.parse(raw) as BudgetDetails | null;
      if (stored && typeof stored.nombre === 'string' && typeof stored.monto === 'number') {
        this.budget = stored;
      }
    } catch (error) {
      console.warn('No se pudo recuperar el presupuesto almacenado', error);
    }
  }

  private persistBudget(budget: BudgetDetails): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(budget));
    } catch (error) {
      console.warn('No se pudo persistir el presupuesto localmente', error);
    }
  }
}

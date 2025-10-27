import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface BudgetDetails {
  nombre: string;
  monto: number;
}

interface PocketDetails {
  id: string;
  nombre: string;
  saldoActual: number;
  gastos: number;
}

interface StoredPocketState {
  budgetName: string;
  budgetAmount: number;
  pockets: PocketDetails[];
}

@Component({
  selector: 'app-pockets',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './pockets.html',
  styleUrl: './pockets.css',
})
export class Pockets {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  private readonly budgetStorageKey = 'encuentros:selected-budget';
  private readonly pocketsStorageKey = 'encuentros:pockets';

  budget: BudgetDetails | null = null;
  pockets: PocketDetails[] = [];
  submitting = false;

  pocketForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(200)]],
  });

  constructor() {
    this.loadBudget();
    this.loadPockets();
  }

  get nombreControl() {
    return this.pocketForm.get('nombre');
  }

  get hasBudget(): boolean {
    return !!this.budget;
  }

  onCreatePocket(): void {
    if (!this.hasBudget) {
      this.router.navigate(['/budgets']);
      return;
    }

    if (this.submitting || this.pocketForm.invalid) {
      this.pocketForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const nombre = (this.pocketForm.value.nombre ?? '').trim();

    const newPocket: PocketDetails = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      nombre,
      saldoActual: 0,
      gastos: 0,
    };

    this.pockets = [...this.pockets, newPocket];
    this.persistPockets();
    this.pocketForm.reset();
    this.pocketForm.markAsPristine();
    this.pocketForm.markAsUntouched();
    this.submitting = false;
  }

  goToBudgets(): void {
    this.router.navigate(['/budgets']);
  }

  goToContributions(): void {
    this.router.navigate(['/contributions']);
  }

  goToCosts(): void {
    this.router.navigate(['/costs']);
  }

  trackPocketById(index: number, pocket: PocketDetails): string {
    return pocket.id ?? `${index}`;
  }

  private loadBudget(): void {
    try {
      const raw = localStorage.getItem(this.budgetStorageKey);
      if (!raw) return;
      const stored = JSON.parse(raw) as BudgetDetails | null;
      if (stored && typeof stored.nombre === 'string' && typeof stored.monto === 'number') {
        this.budget = stored;
      }
    } catch (error) {
      console.warn('No se pudo recuperar el presupuesto seleccionado', error);
    }
  }

  private loadPockets(): void {
    if (!this.budget) {
      this.pockets = [];
      return;
    }

    try {
      const raw = localStorage.getItem(this.pocketsStorageKey);
      if (!raw) {
        this.pockets = [];
        return;
      }

      const stored = JSON.parse(raw) as StoredPocketState | null;
      if (!stored) {
        this.pockets = [];
        return;
      }

      if (stored.budgetName === this.budget.nombre && typeof stored.budgetAmount === 'number') {
        this.pockets = Array.isArray(stored.pockets) ? stored.pockets : [];
      } else {
        this.pockets = [];
      }
    } catch (error) {
      console.warn('No se pudieron recuperar los bolsillos almacenados', error);
      this.pockets = [];
    }
  }

  private persistPockets(): void {
    if (!this.budget) return;
    const payload: StoredPocketState = {
      budgetName: this.budget.nombre,
      budgetAmount: this.budget.monto,
      pockets: this.pockets,
    };

    try {
      localStorage.setItem(this.pocketsStorageKey, JSON.stringify(payload));
    } catch (error) {
      console.warn('No se pudieron guardar los bolsillos', error);
    }
  }
}

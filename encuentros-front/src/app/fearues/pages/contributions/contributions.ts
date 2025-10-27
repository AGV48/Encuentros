import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

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

interface ContributionEntry {
  userId: number;
  userName: string;
  amount: number;
  updatedAt: string;
}

interface PocketContributionState {
  pocketId: string;
  pocketName: string;
  entries: ContributionEntry[];
}

interface PocketSummary extends PocketDetails {
  totalContributions: number;
  myContribution: number;
  otherEntries: ContributionEntry[];
}

interface StoredUser {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
}

type ContributionsStorage = Record<string, PocketContributionState[]>;

@Component({
  selector: 'app-contributions',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './contributions.html',
  styleUrl: './contributions.css',
})
export class Contributions {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  private readonly budgetStorageKey = 'encuentros:selected-budget';
  private readonly pocketsStorageKey = 'encuentros:pockets';
  private readonly contributionsStorageKey = 'encuentros:contributions';

  budget: BudgetDetails | null = null;
  pockets: PocketDetails[] = [];
  pocketSummaries: PocketSummary[] = [];
  currentUser: StoredUser | null = null;

  private contributionState: PocketContributionState[] = [];
  private pocketForms = new Map<string, FormGroup>();
  submittingPocketId: string | null = null;

  constructor() {
    this.loadBudget();
    this.loadCurrentUser();
    this.loadPockets();
    this.loadContributions();
    this.buildPocketSummaries();
  }

  get hasBudget(): boolean {
    return !!this.budget;
  }

  get hasPockets(): boolean {
    return this.pockets.length > 0;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get totalCollected(): number {
    return this.pocketSummaries.reduce((acc, pocket) => acc + pocket.totalContributions, 0);
  }

  get myTotalContribution(): number {
    if (!this.currentUser) {
      return 0;
    }
    return this.pocketSummaries.reduce((acc, pocket) => acc + pocket.myContribution, 0);
  }

  getPocketForm(pocketId: string): FormGroup {
    let form = this.pocketForms.get(pocketId);
    if (!form) {
      form = this.fb.group({
        amount: [
          this.getStoredContributionAmount(pocketId),
          [Validators.required, Validators.min(0.01)],
        ],
      });
      this.pocketForms.set(pocketId, form);
    }
    return form;
  }

  trackPocketById(index: number, pocket: PocketSummary): string {
    return pocket.id ?? `${index}`;
  }

  async confirmContribution(pocketId: string): Promise<void> {
    if (!this.hasBudget) {
      this.router.navigate(['/budgets']);
      return;
    }

    if (!this.isLoggedIn) {
      await Swal.fire({
        title: 'Necesitas iniciar sesión',
        text: 'Inicia sesión para registrar o actualizar tu aporte.',
        icon: 'info',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    const form = this.getPocketForm(pocketId);
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const rawAmount = form.value.amount;
    const amount = this.parseAmount(rawAmount);
    if (amount <= 0) {
      form.get('amount')?.setErrors({ min: true });
      return;
    }

    const pocket = this.pockets.find((item) => item.id === pocketId);
    if (!pocket) {
      await Swal.fire({
        title: 'Bolsillo no encontrado',
        text: 'No pudimos identificar el bolsillo seleccionado. Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    const formattedAmount = this.formatAmount(amount);
    const result = await Swal.fire({
      title: 'Confirmar aporte',
      text: `Registrarás ${formattedAmount} en "${pocket.nombre}". ¿Deseas continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    this.submittingPocketId = pocketId;
    this.updateContributionState(pocketId, amount);
    this.persistContributions();
    this.buildPocketSummaries();
    form.patchValue({ amount }, { emitEvent: false });
    form.markAsPristine();
    form.markAsUntouched();
    this.submittingPocketId = null;

    await Swal.fire({
      title: 'Aporte registrado',
      text: 'Actualizamos tu aporte y el total recaudado del bolsillo.',
      icon: 'success',
      confirmButtonColor: '#2563eb',
    });
  }

  goToBudgets(): void {
    this.router.navigate(['/budgets']);
  }

  goToPockets(): void {
    this.router.navigate(['/pockets']);
  }

  goToCosts(): void {
    this.router.navigate(['/costs']);
  }

  private getStoredContributionAmount(pocketId: string): number | null {
    const pocketState = this.contributionState.find((entry) => entry.pocketId === pocketId);
    const currentUserId = this.currentUser?.id;
    if (!pocketState || currentUserId == null) {
      return null;
    }

    const myEntry = pocketState.entries.find((item) => item.userId === currentUserId);
    if (!myEntry) {
      return null;
    }

    return myEntry.amount;
  }

  private parseAmount(value: unknown): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.replace(/,/g, '.');
      return Number.parseFloat(normalized);
    }
    return 0;
  }

  private formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  private loadBudget(): void {
    try {
      const raw = localStorage.getItem(this.budgetStorageKey);
      if (!raw) {
        return;
      }
      const stored = JSON.parse(raw) as BudgetDetails | null;
      if (stored && typeof stored.nombre === 'string' && typeof stored.monto === 'number') {
        this.budget = stored;
      }
    } catch (error) {
      console.warn('No se pudo recuperar el presupuesto seleccionado', error);
    }
  }

  private loadCurrentUser(): void {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) {
        return;
      }
      const stored = JSON.parse(raw) as StoredUser | null;
      if (stored && typeof stored.id === 'number' && typeof stored.nombre === 'string') {
        this.currentUser = stored;
      }
    } catch (error) {
      console.warn('No se pudo recuperar la sesión de usuario', error);
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

  private loadContributions(): void {
    if (!this.budget) {
      this.contributionState = [];
      return;
    }

    const storageKey = this.buildBudgetKey();
    if (!storageKey) {
      this.contributionState = [];
      return;
    }

    try {
      const raw = localStorage.getItem(this.contributionsStorageKey);
      if (!raw) {
        this.contributionState = [];
        return;
      }

      const stored = JSON.parse(raw) as ContributionsStorage | null;
      if (!stored || typeof stored !== 'object') {
        this.contributionState = [];
        return;
      }

      const entries = stored[storageKey];
      if (Array.isArray(entries)) {
        this.contributionState = entries;
      } else {
        this.contributionState = [];
      }
    } catch (error) {
      console.warn('No se pudieron recuperar los aportes almacenados', error);
      this.contributionState = [];
    }
  }

  private persistContributions(): void {
    const storageKey = this.buildBudgetKey();
    if (!storageKey) {
      return;
    }

    try {
      const raw = localStorage.getItem(this.contributionsStorageKey);
      const stored = raw ? (JSON.parse(raw) as ContributionsStorage) : {};
      stored[storageKey] = this.contributionState;
      localStorage.setItem(this.contributionsStorageKey, JSON.stringify(stored));
    } catch (error) {
      console.warn('No se pudieron guardar los aportes', error);
    }
  }

  private buildPocketSummaries(): void {
    if (!this.hasBudget) {
      this.pocketSummaries = [];
      this.pocketForms.clear();
      return;
    }

    const validPocketIds = new Set(this.pockets.map((pocket) => pocket.id));
    this.contributionState = this.contributionState.filter((state) =>
      validPocketIds.has(state.pocketId)
    );

    this.pocketSummaries = this.pockets.map((pocket) => {
      const state = this.contributionState.find((entry) => entry.pocketId === pocket.id);
      const total =
        state?.entries.reduce(
          (acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0),
          0
        ) ?? 0;

      const myEntry = state?.entries.find((entry) => entry.userId === this.currentUser?.id) ?? null;
      const others = (state?.entries ?? []).filter(
        (entry) => entry.userId !== this.currentUser?.id
      );

      this.ensureFormForPocket(pocket.id, myEntry?.amount ?? null);

      return {
        ...pocket,
        totalContributions: total,
        myContribution: myEntry?.amount ?? 0,
        otherEntries: others,
      } satisfies PocketSummary;
    });

    this.syncPocketForms(validPocketIds);
  }

  private ensureFormForPocket(pocketId: string, amount: number | null): void {
    const form = this.pocketForms.get(pocketId);
    if (!form) {
      const group = this.fb.group({
        amount: [amount ?? null, [Validators.required, Validators.min(0.01)]],
      });
      this.pocketForms.set(pocketId, group);
      return;
    }

    const normalizedAmount = amount ?? null;
    const currentValue = this.parseAmount(form.value.amount);

    if (normalizedAmount === null) {
      form.reset({ amount: null }, { emitEvent: false });
      form.markAsPristine();
      form.markAsUntouched();
      return;
    }

    if (normalizedAmount !== currentValue) {
      form.patchValue({ amount: normalizedAmount }, { emitEvent: false });
      form.markAsPristine();
    }
  }

  private syncPocketForms(validPocketIds: Set<string>): void {
    for (const pocketId of Array.from(this.pocketForms.keys())) {
      if (!validPocketIds.has(pocketId)) {
        this.pocketForms.delete(pocketId);
      }
    }
  }

  private updateContributionState(pocketId: string, amount: number): void {
    if (!this.currentUser) {
      return;
    }

    const pocket = this.pockets.find((item) => item.id === pocketId);
    if (!pocket) {
      return;
    }

    let pocketState = this.contributionState.find((entry) => entry.pocketId === pocketId);
    if (!pocketState) {
      pocketState = {
        pocketId,
        pocketName: pocket.nombre,
        entries: [],
      };
      this.contributionState = [...this.contributionState, pocketState];
    } else {
      pocketState.pocketName = pocket.nombre;
    }

    const timestamp = new Date().toISOString();
    const existing = pocketState.entries.find((entry) => entry.userId === this.currentUser?.id);

    if (existing) {
      existing.amount = amount;
      existing.updatedAt = timestamp;
      existing.userName = this.currentUser.nombre;
    } else {
      pocketState.entries = [
        ...pocketState.entries,
        {
          userId: this.currentUser.id,
          userName: this.currentUser.nombre,
          amount,
          updatedAt: timestamp,
        },
      ];
    }

    this.contributionState = this.contributionState.map((state) =>
      state.pocketId === pocketId ? pocketState! : state
    );
  }

  private buildBudgetKey(): string | null {
    if (!this.budget) {
      return null;
    }
    return `${this.budget.nombre}|${this.budget.monto}`;
  }
}

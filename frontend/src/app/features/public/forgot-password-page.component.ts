import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div class="mb-6">
          <a routerLink="/login" class="text-sm text-gray-500 hover:text-[#2b5e6e] flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Retour à la connexion
          </a>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h2>
        <p class="text-sm text-gray-500 mb-6">Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

        @if (successMessage()) {
          <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mb-4">
            {{ successMessage() }}
          </div>
        }

        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Adresse e-mail</label>
          <input
            type="email"
            formControlName="email"
            placeholder="vous@exemple.com"
            class="w-full border rounded-lg p-3 mb-4 text-sm focus:ring-2 focus:ring-[#2b5e6e] focus:outline-none">

          <button
            type="submit"
            [disabled]="form.invalid || isLoading()"
            class="w-full bg-[#2b5e6e] hover:bg-[#1f4551] text-white py-3 rounded-lg font-bold transition disabled:opacity-50">
            {{ isLoading() ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class ForgotPasswordPageComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  public isLoading = signal(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  submit() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.http.post<{ message: string }>('http://localhost:3000/auth/forgot-password', this.form.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message);
        this.form.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    });
  }
}

import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">

        <h1 class="text-3xl font-bold text-gray-900 mb-2">Réinitialiser votre mot de passe</h1>
        <p class="text-gray-600 mb-8">Entrez votre nouveau mot de passe ci-dessous.</p>

        @if (errorMessage()) {
          <div class="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100">
            {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div class="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm font-medium border border-green-100">
            {{ successMessage() }}
            <p class="text-xs mt-2">Redirection vers la connexion dans {{ redirectCountdown() }}s...</p>
          </div>
        }

        @if (!successMessage()) {
          <form [formGroup]="resetForm" (ngSubmit)="onResetPassword()" class="space-y-5">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <div class="relative">
                <span class="absolute left-3 top-3 text-gray-400">🔒</span>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b5e6e]">
                <span class="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-gray-600" (click)="togglePassword()">
                  {{ showPassword() ? '🙈' : '👁️' }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <div class="relative">
                <span class="absolute left-3 top-3 text-gray-400">✓</span>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="••••••••"
                  class="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b5e6e]">
              </div>
            </div>

            @if (passwordMismatch()) {
              <p class="text-xs text-red-600">Les mots de passe ne correspondent pas.</p>
            }

            <button
              type="submit"
              [disabled]="resetForm.invalid || isLoading() || passwordMismatch()"
              class="w-full bg-[#2b5e6e] hover:bg-[#1f4551] text-white font-bold py-3.5 rounded-lg transition disabled:opacity-50">
              {{ isLoading() ? 'Réinitialisation en cours...' : 'Réinitialiser mon mot de passe →' }}
            </button>

            <button
              type="button"
              (click)="router.navigate(['/login'])"
              class="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition">
              ← Retour à la connexion
            </button>
          </form>
        }
      </div>
    </div>
  `
})
export class ResetPasswordPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);

  public isLoading = signal(false);
  public showPassword = signal(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  public redirectCountdown = signal(5);

  public resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  public passwordMismatch = signal(false);

  ngOnInit() {
    // Vérifier le token au chargement
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.errorMessage.set('Token de réinitialisation manquant ou invalide.');
    }

    // Listener pour vérifier la correspondance des mots de passe
    this.resetForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
    this.resetForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
  }

  togglePassword() {
    this.showPassword.update((value) => !value);
  }

  checkPasswordMatch() {
    const password = this.resetForm.get('password')?.value || '';
    const confirmPassword = this.resetForm.get('confirmPassword')?.value || '';
    this.passwordMismatch.set(!!password && !!confirmPassword && password !== confirmPassword);
  }

  onResetPassword() {
    if (this.resetForm.invalid || this.passwordMismatch()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const token = this.route.snapshot.queryParams['token'] || '';
    const newPassword = this.resetForm.get('password')?.value || '';

    this.authService.resetPassword(token, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Mot de passe réinitialisé avec succès! Vous serez redirigé vers la connexion.');

        // Compte à rebours avant redirection
        const interval = setInterval(() => {
          this.redirectCountdown.update((value) => {
            if (value <= 1) {
              clearInterval(interval);
              this.router.navigate(['/login']);
              return 0;
            }
            return value - 1;
          });
        }, 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error.message || 'Erreur lors de la réinitialisation du mot de passe.');
      }
    });
  }
}

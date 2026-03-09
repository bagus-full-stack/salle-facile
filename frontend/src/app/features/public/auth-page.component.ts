import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex bg-white font-sans">

      <div class="hidden lg:flex lg:w-1/2 relative bg-[#1f3d4a] text-white">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" alt="Espace de travail" class="absolute inset-0 w-full h-full object-cover opacity-60">
        <div class="absolute inset-0 bg-gradient-to-t from-[#132832] to-transparent opacity-80"></div>

        <div class="relative z-10 flex flex-col justify-between p-12 h-full w-full">
          <div class="flex items-center gap-2 font-bold text-xl">
            <span class="bg-white/20 p-2 rounded-lg">🏢</span> SalleFacile
          </div>

          <div class="max-w-md">
            <h1 class="text-5xl font-extrabold mb-6 leading-tight">Trouvez l'espace qui inspire votre productivité.</h1>
            <p class="text-lg text-gray-300 mb-8">Rejoignez plus de 10 000 professionnels qui gèrent leurs réservations d'espaces en toute simplicité.</p>

            <div class="flex items-center gap-4">
              <div class="flex -space-x-3">
                <img class="w-10 h-10 rounded-full border-2 border-[#132832]" src="https://i.pravatar.cc/100?img=1" alt="User">
                <img class="w-10 h-10 rounded-full border-2 border-[#132832]" src="https://i.pravatar.cc/100?img=2" alt="User">
                <img class="w-10 h-10 rounded-full border-2 border-[#132832]" src="https://i.pravatar.cc/100?img=3" alt="User">
                <div class="w-10 h-10 rounded-full border-2 border-[#132832] bg-white/20 flex items-center justify-center text-xs font-bold">+2k</div>
              </div>
              <div>
                <div class="text-yellow-400 text-sm">★★★★★</div>
                <div class="text-xs text-gray-300">Confiance des entreprises</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div class="w-full max-w-md">

          <h2 class="text-3xl font-bold text-gray-900 mb-2">Bienvenue</h2>
          <p class="text-gray-500 mb-8">Commencez votre expérience dès maintenant.</p>

          <div class="flex bg-gray-50 p-1 rounded-xl mb-8 border border-gray-100">
            <button
              (click)="mode.set('LOGIN')"
              [class.bg-white]="mode() === 'LOGIN'" [class.shadow-sm]="mode() === 'LOGIN'" [class.text-gray-900]="mode() === 'LOGIN'" [class.font-bold]="mode() === 'LOGIN'"
              class="flex-1 py-2 text-sm text-gray-500 rounded-lg transition-all">Connexion</button>
            <button
              (click)="mode.set('REGISTER')"
              [class.bg-white]="mode() === 'REGISTER'" [class.shadow-sm]="mode() === 'REGISTER'" [class.text-gray-900]="mode() === 'REGISTER'" [class.font-bold]="mode() === 'REGISTER'"
              class="flex-1 py-2 text-sm text-gray-500 rounded-lg transition-all">Création de compte</button>
          </div>

          @if (errorMessage()) {
            <div class="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium text-center border border-red-100">
              {{ errorMessage() }}
            </div>
          }

          @if (mode() === 'LOGIN') {
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-400">✉️</span>
                  <input type="email" formControlName="email" placeholder="vous@exemple.com" class="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b5e6e]">
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <a href="#" class="text-xs text-gray-500 hover:text-[#2b5e6e]">Oublié ?</a>
                </div>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-400">🔒</span>
                  <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b5e6e]">
                  <span class="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-gray-600" (click)="togglePassword()">
                    {{ showPassword() ? '🙈' : '👁️' }}
                  </span>
                </div>
              </div>

              <div class="flex items-center">
                <input type="checkbox" class="h-4 w-4 text-[#2b5e6e] focus:ring-[#2b5e6e] border-gray-300 rounded">
                <label class="ml-2 block text-sm text-gray-500">Se souvenir de moi</label>
              </div>

              <button type="submit" [disabled]="loginForm.invalid || isLoading()" class="w-full bg-[#2b5e6e] hover:bg-[#1f4551] text-white font-bold py-3.5 rounded-lg transition disabled:opacity-50 flex justify-center">
                {{ isLoading() ? 'Connexion en cours...' : 'Se connecter →' }}
              </button>
            </form>
          }

          @if (mode() === 'REGISTER') {
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-5">

              <div class="grid grid-cols-2 gap-4 mb-2">
                <button type="button" (click)="setAccountType('INDIVIDUAL')"
                  [class.border-[#2b5e6e]]="registerForm.value.accountType === 'INDIVIDUAL'" [class.bg-blue-50]="registerForm.value.accountType === 'INDIVIDUAL'"
                  class="border rounded-lg p-3 text-center transition">
                  <div class="text-xl mb-1 text-gray-400">👤</div>
                  <div class="text-sm font-medium text-gray-700">Particulier</div>
                </button>
                <button type="button" (click)="setAccountType('PROFESSIONAL')"
                  [class.border-[#2b5e6e]]="registerForm.value.accountType === 'PROFESSIONAL'" [class.bg-blue-50]="registerForm.value.accountType === 'PROFESSIONAL'"
                  class="border rounded-lg p-3 text-center transition relative">
                  @if (registerForm.value.accountType === 'PROFESSIONAL') {
                    <span class="absolute top-2 right-2 text-[#2b5e6e] text-xs">✔️</span>
                  }
                  <div class="text-xl mb-1 text-gray-400">🏢</div>
                  <div class="text-sm font-medium text-gray-700">Professionnel</div>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" formControlName="firstName" placeholder="Jean" class="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-[#2b5e6e] outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" formControlName="lastName" placeholder="Dupont" class="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-[#2b5e6e] outline-none">
                </div>
              </div>

              @if (registerForm.value.accountType === 'PROFESSIONAL') {
                <div class="p-4 bg-gray-50 border border-gray-100 rounded-lg space-y-4">
                  <div class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">💼 Informations Société</div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                    <input type="text" formControlName="companyName" placeholder="Ex: SalleFacile SAS" class="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-[#2b5e6e] outline-none">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Numéro de SIRET <span class="text-gray-400 font-normal">(Optionnel)</span></label>
                    <input type="text" formControlName="siret" placeholder="14 chiffres" class="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-[#2b5e6e] outline-none">
                  </div>
                </div>
              }

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-gray-400">✉️</span>
                  <input type="email" formControlName="email" placeholder="jean.dupont@entreprise.com" class="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 text-gray-700 focus:ring-2 focus:ring-[#2b5e6e] outline-none">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-gray-400">🔒</span>
                  <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" class="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-10 text-gray-700 focus:ring-2 focus:ring-[#2b5e6e] outline-none">
                  <span class="absolute right-3 top-2.5 text-gray-400 cursor-pointer hover:text-gray-600" (click)="togglePassword()">
                    {{ showPassword() ? '🙈' : '👁️' }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 mt-1">Le mot de passe doit contenir au moins 8 caractères.</p>
              </div>

              <button type="submit" [disabled]="registerForm.invalid || isLoading()" class="w-full bg-[#2b5e6e] hover:bg-[#1f4551] text-white font-bold py-3.5 rounded-lg transition mt-6 disabled:opacity-50">
                {{ isLoading() ? 'Création en cours...' : 'Créer mon compte →' }}
              </button>
            </form>
          }

          <div class="mt-8 relative text-center">
            <span class="bg-white px-4 text-xs text-gray-400 uppercase tracking-widest relative z-10">OU CONTINUER AVEC</span>
            <div class="absolute top-1/2 left-0 w-full border-t border-gray-200"></div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-6">
            <a href="http://localhost:3000/auth/google" class="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition shadow-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5"> Google
            </a>

            <a href="http://localhost:3000/auth/linkedin" class="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition shadow-sm">
              <img src="https://www.svgrepo.com/show/475661/linkedin-color.svg" class="w-5 h-5"> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signaux d'état
  public mode = signal<'LOGIN' | 'REGISTER'>('LOGIN');
  public isLoading = signal(false);
  public showPassword = signal(false);
  public errorMessage = signal<string | null>(null);

  // Formulaire de Connexion
  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  // Formulaire d'Inscription
  public registerForm = this.fb.group({
    accountType: ['INDIVIDUAL'],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    companyName: [''],
    siret: ['']
  });

  setAccountType(type: 'INDIVIDUAL' | 'PROFESSIONAL') {
    this.registerForm.patchValue({ accountType: type });
    // Optionnel : Ajouter ou retirer dynamiquement les Validators requis pour la société
  }

  togglePassword() {
    this.showPassword.update((value) => !value);
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);

        // On regarde si une URL de retour était demandée (ex: /checkout)
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];

        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          // Sinon, redirection classique selon le rôle
          const targetRoute = res.user.role === 'USER' ? '/mon-espace' : '/admin';
          this.router.navigate([targetRoute]);
        }

        // Redirection conditionnelle basée sur le rôle
        // const targetRoute = res.user.role === 'USER' ? '/mon-espace' : '/admin';
        // this.router.navigate([targetRoute]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error.message || 'Identifiants incorrects.');
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.router.navigate(['/mon-espace']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error.message || "Erreur lors de l'inscription.");
      }
    });
  }
}

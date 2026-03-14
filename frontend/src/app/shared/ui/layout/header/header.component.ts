import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center gap-2">
            <a routerLink="/" class="text-2xl font-extrabold text-[#1da1f2] tracking-tighter hover:opacity-80 transition">
              Salle<span class="text-gray-900">Facile</span>.
            </a>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex space-x-8">
            <a routerLink="/" routerLinkActive="text-[#1da1f2]" [routerLinkActiveOptions]="{exact: true}"
               class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition">
               Accueil
            </a>
            <a routerLink="/salles/1" routerLinkActive="text-[#1da1f2]"
               class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition cursor-not-allowed opacity-50" title="Exemple de salle">
               Nos Salles
            </a>
            <!-- Lien Admin si rôle approprié -->
            @if (isAdminOrManager()) {
              <a routerLink="/admin" routerLinkActive="text-[#1da1f2]"
                 class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition">
                 Admin
              </a>
            }
          </nav>

          <!-- Actions Auth -->
          <div class="flex items-center gap-4">
            @if (authService.currentUser()) {
              <div class="hidden md:flex items-center gap-3">
                <span class="text-sm text-gray-700">Bonjour, <span class="font-bold">{{ authService.currentUser()?.firstName }}</span></span>
                <a routerLink="/mon-espace" class="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition">
                  Mon Espace
                </a>
                <button (click)="authService.logout()" class="text-gray-400 hover:text-red-500 transition" title="Se déconnecter">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              </div>
            } @else {
              <div class="flex items-center gap-3">
                <a routerLink="/login" class="text-gray-500 hover:text-gray-900 text-sm font-medium transition">
                  Se connecter
                </a>
                <a routerLink="/login" [queryParams]="{mode: 'register'}"
                   class="bg-[#1da1f2] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition transform hover:-translate-y-0.5">
                  S'inscrire
                </a>
              </div>
            }
          </div>

        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  public authService = inject(AuthService);

  isAdminOrManager() {
    const user = this.authService.currentUser();
    return user && ['SUPER_ADMIN', 'MANAGER', 'STAFF'].includes(user.role);
  }
}


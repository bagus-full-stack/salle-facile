import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen bg-gray-50 font-sans">

      <!-- ============================== -->
      <!-- 🟦 SIDEBAR -->
      <!-- ============================== -->
      <aside class="w-64 bg-[#0b1e34] text-white flex flex-col shrink-0">

        <!-- Logo -->
        <div class="p-6 border-b border-white/10">
          <a routerLink="/" class="flex items-center gap-3">
            <div class="bg-[#1da1f2] p-2 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <span class="text-lg font-extrabold tracking-tight">SalleFacile</span>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">

          <!-- Dashboard -->
          <a routerLink="/admin/dashboard" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2] active-link"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white group-[.active-link]:text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            Tableau de bord
          </a>

          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3 mt-6">Gestion</p>

          <!-- Salles -->
          <a routerLink="/admin/salles" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2] active-link"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white group-[.active-link]:text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Salles
          </a>

          <!-- Utilisateurs & Rôles -->
          <a routerLink="/admin/utilisateurs" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2] active-link"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white group-[.active-link]:text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            Utilisateurs & Rôles
          </a>

          <!-- Réservations -->
          <a routerLink="/admin/reservations" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2] active-link"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white group-[.active-link]:text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Réservations
          </a>

          <!-- Planning -->
          <a routerLink="/admin/planning" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2] active-link"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white group-[.active-link]:text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Planning
          </a>

          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3 mt-6">Administration</p>

          <!-- Finances -->
          <a routerLink="/admin/finances" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2] active-link"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
             <svg class="w-5 h-5 text-gray-400 group-hover:text-white group-[.active-link]:text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
             </svg>
            Finances
          </a>

          <!-- Analyses -->
          <a routerLink="/admin/analyses" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2] active-link"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white group-[.active-link]:text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Analyses
          </a>

          <!-- Paramètres -->
          <a routerLink="/admin/parametres" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2] active-link"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white group-[.active-link]:text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Paramètres
          </a>

        </nav>

        <!-- Profil admin en bas -->
        <div class="p-4 border-t border-white/10">
          @if (currentUser(); as user) {
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 bg-[#1da1f2] rounded-full flex items-center justify-center text-sm font-bold">
                {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate">{{ user.firstName }} {{ user.lastName }}</p>
                <p class="text-xs text-gray-400 truncate">{{ user.role }}</p>
              </div>
            </div>
          }
          <div class="flex gap-2">
            <a routerLink="/" class="flex-1 text-center text-xs bg-white/10 hover:bg-white/20 text-gray-300 py-2 rounded-lg transition font-medium">
              Voir le site
            </a>
            <button (click)="logout()" class="flex-1 text-center text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg transition font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <!-- ============================== -->
      <!-- 📄 CONTENU PRINCIPAL -->
      <!-- ============================== -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet />
      </main>

    </div>
  `
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}


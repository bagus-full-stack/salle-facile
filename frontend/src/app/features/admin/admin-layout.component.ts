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

          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3 mt-2">Général</p>

          <a routerLink="/admin/finances" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Finances
          </a>

          <a routerLink="/admin/analyses" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Analyses
          </a>

          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3 mt-6">Gestion</p>

          <a routerLink="/admin/reservations" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Réservations
          </a>

          <a routerLink="/admin/salles/edition" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Salles
          </a>

          <a routerLink="/admin/utilisateurs" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Utilisateurs
          </a>

          <a routerLink="/admin/planning" routerLinkActive="bg-[#1da1f2]/20 text-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Planning
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


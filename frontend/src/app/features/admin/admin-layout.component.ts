import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-100">
          <a routerLink="/" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#1da1f2] rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <span class="text-xl font-bold text-[#0b648f]">SalleFacile</span>
              <span class="block text-xs text-gray-400">Admin Panel</span>
            </div>
          </a>
        </div>

        <!-- Navigation principale -->
        <nav class="flex-1 p-4 space-y-1">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">Principal</div>
          
          <a routerLink="/admin/reservations" routerLinkActive="bg-blue-50 text-[#0b648f] border-l-4 border-[#1da1f2]" 
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Reservations
          </a>

          <a routerLink="/admin/salles" routerLinkActive="bg-blue-50 text-[#0b648f] border-l-4 border-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Gestion des Salles
          </a>

          <a routerLink="/admin/finances" routerLinkActive="bg-blue-50 text-[#0b648f] border-l-4 border-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            Facturation & Paiements
          </a>

          <a routerLink="/admin/analyses" routerLinkActive="bg-blue-50 text-[#0b648f] border-l-4 border-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Rapports Detailles
          </a>

          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mt-6 mb-3">Administration</div>

          <a routerLink="/admin/utilisateurs" routerLinkActive="bg-blue-50 text-[#0b648f] border-l-4 border-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            Utilisateurs & Roles
          </a>

          <a routerLink="/admin/parametres" routerLinkActive="bg-blue-50 text-[#0b648f] border-l-4 border-[#1da1f2]"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Parametres
          </a>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-gray-100">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#1da1f2] to-[#0b648f] flex items-center justify-center text-white font-bold">
              {{ getUserInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-900 truncate">{{ getCurrentUserName() }}</div>
              <div class="text-xs text-gray-500">Admin</div>
            </div>
            <button (click)="logout()" class="p-2 hover:bg-gray-200 rounded-lg transition" title="Deconnexion">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 ml-64">
        <!-- Top Bar -->
        <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <nav class="flex items-center gap-2 text-sm text-gray-500">
            <a routerLink="/" class="hover:text-[#1da1f2] transition">Accueil</a>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span class="text-gray-400">Administration</span>
          </nav>

          <div class="flex items-center gap-4">
            <button class="p-2 hover:bg-gray-100 rounded-lg transition relative">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="Admin" class="w-full h-full object-cover">
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  getCurrentUserName(): string {
    const user = this.authService.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Admin User';
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (user) {
      return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    }
    return 'AU';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

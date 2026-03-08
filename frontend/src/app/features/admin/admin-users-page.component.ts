import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService, AdminUser } from '../../core/services/admin-users.service';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <div class="flex justify-between items-end mb-8">
        <div>
          <div class="text-sm text-[#1da1f2] font-semibold mb-1 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Dashboard / Utilisateurs
          </div>
          <h1 class="text-3xl font-extrabold text-gray-900">Gestion des Utilisateurs</h1>
          <p class="text-gray-500 mt-1">Administrez les rôles, les accès et consultez la base clients.</p>
        </div>

        <div class="flex gap-4">
          <div class="bg-white border border-gray-100 rounded-lg px-4 py-2 shadow-sm text-center">
            <div class="text-xs text-gray-500 font-bold uppercase">Total Inscrits</div>
            <div class="text-xl font-extrabold text-[#0b648f]">{{ users().length }}</div>
          </div>
          <div class="bg-white border border-gray-100 rounded-lg px-4 py-2 shadow-sm text-center">
            <div class="text-xs text-gray-500 font-bold uppercase">Staff & Admins</div>
            <div class="text-xl font-extrabold text-[#1da1f2]">{{ staffCount() }}</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div class="relative w-72">
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              [value]="searchTerm()"
              (input)="updateSearch($event)"
              placeholder="Rechercher par nom, email..."
              class="w-full border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#1da1f2] outline-none">
          </div>
          <button class="text-sm font-semibold border border-gray-200 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm">
            Exporter (.csv)
          </button>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center items-center h-48">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0b648f]"></div>
          </div>
        } @else {
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-white text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th class="px-6 py-4">Utilisateur</th>
                <th class="px-6 py-4">Type de Profil</th>
                <th class="px-6 py-4">Activité</th>
                <th class="px-6 py-4">Rôle Système</th>
                <th class="px-6 py-4">Statut</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-gray-700">

              @for (user of filteredUsers(); track user.id) {
                <tr class="hover:bg-gray-50 transition" [class.opacity-50]="!user.isActive">

                  <td class="px-6 py-4">
                    <div class="font-bold text-gray-900 flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                      </div>
                      <div>
                        <div>{{ user.firstName }} {{ user.lastName }}</div>
                        <div class="text-xs text-gray-500 font-normal">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>

                  <td class="px-6 py-4">
                    @if (user.accountType === 'PROFESSIONAL') {
                      <span class="text-gray-900 font-semibold flex items-center gap-1.5">
                        🏢 Pro <span class="text-xs text-gray-400 font-normal">({{ user.companyName }})</span>
                      </span>
                    } @else {
                      <span class="text-gray-500 flex items-center gap-1.5">👤 Particulier</span>
                    }
                  </td>

                  <td class="px-6 py-4">
                    <span class="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-md">
                      {{ user._count.reservations }} Résa(s)
                    </span>
                    <div class="text-[10px] text-gray-400 mt-1">Inscrit le {{ user.createdAt | date:'dd/MM/yyyy' }}</div>
                  </td>

                  <td class="px-6 py-4">
                    <select
                      [value]="user.role"
                      (change)="changeRole(user.id, $event)"
                      [disabled]="!user.isActive"
                      class="border border-gray-200 rounded-lg py-1.5 px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1da1f2]"
                      [ngClass]="{
                        'bg-blue-50 text-[#0b648f] border-blue-200': user.role === 'SUPER_ADMIN',
                        'bg-green-50 text-green-700 border-green-200': user.role === 'MANAGER',
                        'bg-gray-50 text-gray-700': user.role === 'USER'
                      }">
                      <option value="USER">Client (User)</option>
                      <option value="STAFF">Staff (Opérationnel)</option>
                      <option value="MANAGER">Manager (Gestion)</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </td>

                  <td class="px-6 py-4">
                    @if (user.isActive) {
                      <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex w-max items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Actif
                      </span>
                    } @else {
                      <span class="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex w-max items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Bloqué
                      </span>
                    }
                  </td>

                  <td class="px-6 py-4 text-right">
                    <button
                      (click)="toggleStatus(user.id, user.isActive)"
                      class="text-xs font-bold px-3 py-1.5 rounded transition shadow-sm border"
                      [ngClass]="user.isActive ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'">
                      {{ user.isActive ? 'Suspendre' : 'Réactiver' }}
                    </button>
                  </td>
                </tr>
              }

              @if (filteredUsers().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur ne correspond à votre recherche.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `
})
export class AdminUsersPageComponent implements OnInit {
  private usersService = inject(AdminUsersService);

  // État
  public users = signal<AdminUser[]>([]);
  public isLoading = signal<boolean>(true);
  public searchTerm = signal<string>('');

  // ⚡️ Signal calculé pour la recherche en temps réel et le comptage du Staff
  public filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(u =>
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  public staffCount = computed(() =>
    this.users().filter(u => ['SUPER_ADMIN', 'MANAGER', 'STAFF'].includes(u.role)).length
  );

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.usersService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  changeRole(userId: string, event: Event) {
    const newRole = (event.target as HTMLSelectElement).value;

    if (confirm(`Confirmez-vous le changement de rôle vers ${newRole} pour cet utilisateur ?`)) {
      this.usersService.updateRole(userId, newRole).subscribe({
        next: () => {
          // Mise à jour optimiste du signal local
          this.users.update(list => list.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
        },
        error: (err) => {
          alert(err.error.message || 'Erreur lors de la modification du rôle.');
          this.loadUsers(); // Recharger pour annuler le changement visuel
        }
      });
    } else {
      this.loadUsers(); // Annuler visuellement si l'admin clique sur "Annuler"
    }
  }

  toggleStatus(userId: string, currentlyActive: boolean) {
    const action = currentlyActive ? 'suspendre' : 'réactiver';

    if (confirm(`Êtes-vous sûr de vouloir ${action} ce compte ?`)) {
      this.usersService.toggleStatus(userId).subscribe({
        next: () => {
          this.users.update(list => list.map(u => u.id === userId ? { ...u, isActive: !currentlyActive } : u));
        },
        error: (err) => {
          alert(err.error.message || `Erreur lors de l'opération.`);
        }
      });
    }
  }
}

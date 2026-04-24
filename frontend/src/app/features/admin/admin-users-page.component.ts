import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminUsersService, AdminUser } from '../../core/services/admin-users.service';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
            <button (click)="openModal()" class="bg-[#0b648f] hover:bg-[#084a6b] text-white font-bold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 text-sm transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Ajouter un utilisateur
            </button>
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

                  <td class="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      (click)="toggleStatus(user.id, user.isActive)"
                      class="text-xs font-bold px-3 py-1.5 rounded transition shadow-sm border"
                      [ngClass]="user.isActive ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'">
                      {{ user.isActive ? 'Suspendre' : 'Réactiver' }}
                    </button>
                    <!-- Bouton Modifier -->
                    <button
                        (click)="openModal(user)"
                        class="bg-blue-50 text-blue-600 hover:bg-blue-100 p-1.5 rounded border border-blue-200"
                        title="Modifier">
                        ✏️
                    </button>
                    <!-- Bouton Supprimer -->
                    <button
                        (click)="deleteUser(user.id)"
                        class="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded border border-red-200"
                        title="Supprimer définitivement">
                        🗑️
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

    <!-- MODAL AJOUT/EDITION UTILISATEUR -->
    @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 class="text-lg font-bold text-gray-900">{{ editingUserId() ? "Modifier l'utilisateur" : 'Nouvel Utilisateur' }}</h3>
                    <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition">✕</button>
                </div>

                <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
                            <input type="text" formControlName="firstName" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1da1f2]">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
                            <input type="text" formControlName="lastName" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1da1f2]">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input type="email" formControlName="email" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1da1f2]">
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
                        <input type="password" formControlName="password" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1da1f2]" [placeholder]="editingUserId() ? 'Laisser vide pour ne pas changer' : ''">
                        @if (!editingUserId()) {
                          <p class="text-xs text-gray-400 mt-1">Min. 8 caractères</p>
                        } @else {
                          <p class="text-xs text-gray-400 mt-1">Optionnel (modifier uniquement pour changer le mot de passe)</p>
                        }
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Rôle</label>
                            <select formControlName="role" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1da1f2] bg-white">
                                <option value="USER">Client</option>
                                <option value="STAFF">Staff</option>
                                <option value="MANAGER">Manager</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                        </div>
                         <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Type de Compte</label>
                            <select formControlName="accountType" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1da1f2] bg-white">
                                <option value="INDIVIDUAL">Particulier</option>
                                <option value="PROFESSIONAL">Professionnel</option>
                            </select>
                        </div>
                    </div>

                    @if (isProfessional()) {
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Nom de l'entreprise</label>
                                <input type="text" formControlName="companyName" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1da1f2]">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Numéro de SIRET</label>
                                <input type="text" formControlName="siret" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1da1f2]" placeholder="ex: 123 456 789 00012">
                            </div>
                        </div>
                    }

                    <div class="pt-4 flex justify-end gap-3">
                        <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition">Annuler</button>
                        <button type="submit" [disabled]="userForm.invalid || isSubmitting()" class="px-4 py-2 text-sm font-bold text-white bg-[#0b648f] hover:bg-[#084a6b] rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-2">
                             @if (isSubmitting()) {
                                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             }
                             {{ editingUserId() ? 'Modifier' : "Créer l'utilisateur" }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    }
  `
})
export class AdminUsersPageComponent implements OnInit {
  private usersService = inject(AdminUsersService);
  private fb = inject(FormBuilder);

  // État
  public users = signal<AdminUser[]>([]);
  public isLoading = signal<boolean>(true);
  public searchTerm = signal<string>('');

  public isModalOpen = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public editingUserId = signal<string | null>(null);
  public isProfessional = signal<boolean>(false);

  public userForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''], // Initialisé sans validators ici, ajoutés dynamiquement
    role: ['USER', Validators.required],
    accountType: ['INDIVIDUAL', Validators.required],
    companyName: [''],
    siret: ['']
  });

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
    // Sync signal with form for OnPush strategy
    this.userForm.get('accountType')?.valueChanges.subscribe(val => {
        this.isProfessional.set(val === 'PROFESSIONAL');
    });
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

  openModal(user?: AdminUser) {
    if (user) {
        this.editingUserId.set(user.id);
        this.userForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            accountType: user.accountType as any,
            companyName: user.companyName || '',
            siret: user.siret || ''
        });

        // Ensure signal is in sync (patchValue emits event, but let's be safe for initial state)
        this.isProfessional.set(user.accountType === 'PROFESSIONAL');

        // Pas de mot de passe requis en modification
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
    } else {
        this.editingUserId.set(null);
        this.userForm.reset({ role: 'USER', accountType: 'INDIVIDUAL' });

        this.isProfessional.set(false);

        // Mot de passe requis en création
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.userForm.get('password')?.updateValueAndValidity();
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingUserId.set(null);
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    this.isSubmitting.set(true);

    const formData = this.userForm.value as any;

    if (this.editingUserId()) {
        const userId = this.editingUserId()!;
        // Si le mot de passe est vide, on l'enlève de l'objet envoyé
        if (!formData.password) delete formData.password;

        this.usersService.updateUser(userId, formData).subscribe({
            next: (updatedUser) => {
                this.users.update(list => list.map(u => u.id === userId ? updatedUser : u));
                alert('Utilisateur modifié avec succès !');
                this.isSubmitting.set(false);
                this.closeModal();
            },
            error: (err) => {
                console.error(err);
                alert('Erreur: ' + (err.error?.message || 'Impossible de modifier l\'utilisateur'));
                this.isSubmitting.set(false);
            }
        });
    } else {
        this.usersService.createUser(formData).subscribe({
            next: (user) => {
                this.users.update(list => [user, ...list]);
                alert('Utilisateur créé avec succès !');
                this.isSubmitting.set(false);
                this.closeModal();
            },
            error: (err) => {
                console.error(err);
                alert('Erreur: ' + (err.error?.message || 'Impossible de créer l\'utilisateur'));
                this.isSubmitting.set(false);
            }
        });
    }
  }

  changeRole(userId: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newRole = target.value;
    if(confirm('Modifier le rôle de cet utilisateur ?')) {
        this.usersService.updateRole(userId, newRole).subscribe({
            next: () => {
                this.users.update(list => list.map(u => u.id === userId ? {...u, role: newRole as any} : u));
            },
            error: () => alert('Erreur lors de la modification')
        });
    } else {
        // Reset selection if cancelled (simplified)
        this.loadUsers();
    }
  }

  toggleStatus(userId: string, currentStatus: boolean) {
      this.usersService.toggleStatus(userId).subscribe({
          next: () => {
              this.users.update(list => list.map(u => u.id === userId ? {...u, isActive: !currentStatus} : u));
          },
          error: () => alert('Erreur lors du changement de statut')
      });
  }

  deleteUser(userId: string) {
      if(confirm('ATTENTION: Voulez-vous vraiment supprimer définitivement cet utilisateur ? Cette action est irréversible.')) {
          this.usersService.deleteUser(userId).subscribe({
              next: () => {
                  this.users.update(list => list.filter(u => u.id !== userId));
                  alert('Utilisateur supprimé avec succès');
              },
              error: (err) => {
                  console.error(err);
                  alert('Erreur: ' + (err.error?.message || 'Impossible de supprimer cet utilisateur (peut-être a-t-il des réservations ?)'));
              }
          });
      }
  }
}



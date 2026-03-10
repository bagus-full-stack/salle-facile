import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService, AdminUser } from '../../core/services/admin-users.service';

type TabType = 'users' | 'roles' | 'activity';
type RoleFilter = 'ALL' | 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'USER';
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'PENDING';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900">Gestion des Utilisateurs</h1>
          <p class="text-gray-500 mt-1">Gerez les acces, les roles et les permissions de votre equipe pour assurer la securite de la plateforme.</p>
        </div>
        <button (click)="openAddUserModal()" class="bg-[#1da1f2] text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-[#0b648f] transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Ajouter un utilisateur
        </button>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div class="border-b border-gray-100">
          <nav class="flex gap-1 p-2">
            <button (click)="activeTab.set('users')" 
                    [class.bg-blue-50]="activeTab() === 'users'"
                    [class.text-[#0b648f]]="activeTab() === 'users'"
                    [class.border-b-2]="activeTab() === 'users'"
                    [class.border-[#1da1f2]]="activeTab() === 'users'"
                    class="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-t-lg transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Liste des Utilisateurs
              <span class="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{{ users().length }}</span>
            </button>
            <button (click)="activeTab.set('roles')" 
                    [class.bg-blue-50]="activeTab() === 'roles'"
                    [class.text-[#0b648f]]="activeTab() === 'roles'"
                    class="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-t-lg transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Gestion des Roles
            </button>
            <button (click)="activeTab.set('activity')" 
                    [class.bg-blue-50]="activeTab() === 'activity'"
                    [class.text-[#0b648f]]="activeTab() === 'activity'"
                    class="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-t-lg transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Log d'activite
            </button>
          </nav>
        </div>

        <!-- Tab Content: Users List -->
        @if (activeTab() === 'users') {
          <div class="p-4">
            <!-- Filters Row -->
            <div class="flex items-center justify-between gap-4 mb-4">
              <div class="relative flex-1 max-w-md">
                <span class="absolute left-3 top-2.5 text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  [value]="searchTerm()"
                  (input)="updateSearch($event)"
                  placeholder="Rechercher (Nom, Email, ID)..."
                  class="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1da1f2] outline-none">
              </div>
              <div class="flex gap-3">
                <select (change)="updateRoleFilter($event)" class="border border-gray-200 rounded-lg py-2 px-4 text-sm focus:ring-2 focus:ring-[#1da1f2] outline-none bg-white">
                  <option value="ALL">Tous les roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="MANAGER">Gestionnaire</option>
                  <option value="STAFF">Staff</option>
                  <option value="USER">Utilisateur</option>
                </select>
                <select (change)="updateStatusFilter($event)" class="border border-gray-200 rounded-lg py-2 px-4 text-sm focus:ring-2 focus:ring-[#1da1f2] outline-none bg-white">
                  <option value="ALL">Statut: Tous</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="PENDING">En attente</option>
                </select>
              </div>
            </div>

            <!-- Users Table -->
            @if (isLoading()) {
              <div class="flex justify-center items-center h-48">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0b648f]"></div>
              </div>
            } @else {
              <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th class="px-6 py-4">Utilisateur</th>
                    <th class="px-6 py-4">Role</th>
                    <th class="px-6 py-4">Date d'ajout</th>
                    <th class="px-6 py-4">Statut</th>
                    <th class="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (user of paginatedUsers(); track user.id) {
                    <tr class="hover:bg-gray-50 transition" [class.opacity-50]="!user.isActive">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            @if (user.avatarUrl) {
                              <img [src]="user.avatarUrl" [alt]="user.firstName" class="w-full h-full rounded-full object-cover">
                            } @else {
                              <span class="text-[#0b648f] font-bold">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</span>
                            }
                          </div>
                          <div>
                            <div class="font-semibold text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                            <div class="text-xs text-gray-500">{{ user.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        @switch (user.role) {
                          @case ('SUPER_ADMIN') {
                            <span class="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                              <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                              Super Admin
                            </span>
                          }
                          @case ('MANAGER') {
                            <span class="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                              </svg>
                              Gestionnaire
                            </span>
                          }
                          @case ('STAFF') {
                            <span class="inline-flex items-center gap-1.5 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                              </svg>
                              Staff
                            </span>
                          }
                          @default {
                            <span class="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                              Utilisateur
                            </span>
                          }
                        }
                      </td>
                      <td class="px-6 py-4 text-gray-600">
                        {{ user.createdAt | date:'dd MMM yyyy':'':'fr-FR' }}
                      </td>
                      <td class="px-6 py-4">
                        @if (user.isActive) {
                          <span class="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            Actif
                          </span>
                        } @else if (user.isPending) {
                          <span class="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                            En attente
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1.5 bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                            Inactif
                          </span>
                        }
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button (click)="editUser(user)" class="p-2 hover:bg-gray-100 rounded-lg transition" title="Modifier">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                          <button (click)="toggleStatus(user.id, user.isActive)" class="p-2 hover:bg-gray-100 rounded-lg transition" [title]="user.isActive ? 'Suspendre' : 'Reactiver'">
                            @if (user.isActive) {
                              <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                              </svg>
                            } @else {
                              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  }

                  @if (filteredUsers().length === 0) {
                    <tr>
                      <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                        Aucun utilisateur ne correspond a votre recherche.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Pagination -->
              @if (filteredUsers().length > 0) {
                <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <span class="text-sm text-gray-500">
                    Affichage de {{ ((currentPage() - 1) * pageSize) + 1 }} a {{ Math.min(currentPage() * pageSize, filteredUsers().length) }} sur {{ filteredUsers().length }} resultats
                  </span>
                  <div class="flex gap-2">
                    <button 
                      (click)="previousPage()" 
                      [disabled]="currentPage() === 1"
                      class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                      Precedent
                    </button>
                    @for (page of visiblePages(); track page) {
                      <button 
                        (click)="goToPage(page)"
                        [class.bg-[#1da1f2]]="currentPage() === page"
                        [class.text-white]="currentPage() === page"
                        class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                        {{ page }}
                      </button>
                    }
                    <button 
                      (click)="nextPage()" 
                      [disabled]="currentPage() === totalPages()"
                      class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                      Suivant
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- Tab Content: Roles -->
        @if (activeTab() === 'roles') {
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Super Admin Role Card -->
              <div class="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-lg">S</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Super Admin</h3>
                </div>
                <p class="text-sm text-gray-600 mb-4">Acces complet a toutes les fonctionnalites et parametres systeme.</p>
                <div class="text-2xl font-bold text-red-600">{{ getRoleCount('SUPER_ADMIN') }}</div>
                <div class="text-xs text-gray-500">utilisateur(s)</div>
              </div>

              <!-- Manager Role Card -->
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 class="font-bold text-gray-900">Gestionnaire</h3>
                </div>
                <p class="text-sm text-gray-600 mb-4">Gestion des salles, reservations et rapports financiers.</p>
                <div class="text-2xl font-bold text-blue-600">{{ getRoleCount('MANAGER') }}</div>
                <div class="text-xs text-gray-500">utilisateur(s)</div>
              </div>

              <!-- Staff Role Card -->
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h3 class="font-bold text-gray-900">Staff</h3>
                </div>
                <p class="text-sm text-gray-600 mb-4">Consultation et gestion quotidienne des reservations.</p>
                <div class="text-2xl font-bold text-gray-600">{{ getRoleCount('STAFF') }}</div>
                <div class="text-xs text-gray-500">utilisateur(s)</div>
              </div>

              <!-- User Role Card -->
              <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="font-bold text-gray-900">Utilisateur</h3>
                </div>
                <p class="text-sm text-gray-600 mb-4">Acces client standard pour reserver des salles.</p>
                <div class="text-2xl font-bold text-green-600">{{ getRoleCount('USER') }}</div>
                <div class="text-xs text-gray-500">utilisateur(s)</div>
              </div>
            </div>
          </div>
        }

        <!-- Tab Content: Activity Log -->
        @if (activeTab() === 'activity') {
          <div class="p-6">
            <div class="space-y-4">
              @for (log of activityLogs; track log.id) {
                <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span class="text-[#0b648f] font-bold text-sm">{{ log.userInitials }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">
                      <span class="font-semibold">{{ log.userName }}</span>
                      <span class="text-gray-600"> {{ log.action }}</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">{{ log.timestamp }}</p>
                  </div>
                  <span class="text-xs font-medium px-2 py-1 rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-700': log.type === 'success',
                          'bg-blue-100 text-blue-700': log.type === 'info',
                          'bg-yellow-100 text-yellow-700': log.type === 'warning',
                          'bg-red-100 text-red-700': log.type === 'error'
                        }">
                    {{ log.typeLabel }}
                  </span>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Bottom Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-1">Politique de securite</h3>
            <p class="text-sm text-gray-500 mb-3">Assurez-vous que chaque utilisateur dispose uniquement des permissions necessaires a son role pour minimiser les risques.</p>
            <a href="#" class="text-sm text-[#1da1f2] font-semibold hover:underline flex items-center gap-1">
              Lire la documentation
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-1">Export des donnees</h3>
            <p class="text-sm text-gray-500 mb-3">Telechargez la liste complete des utilisateurs et leurs logs d'activite au format CSV pour l'audit.</p>
            <button (click)="exportCsv()" class="text-sm text-[#1da1f2] font-semibold hover:underline flex items-center gap-1">
              Exporter CSV
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersPageComponent implements OnInit {
  protected Math = Math;
  private usersService = inject(AdminUsersService);

  // State
  public users = signal<AdminUser[]>([]);
  public isLoading = signal<boolean>(true);
  public searchTerm = signal<string>('');
  public activeTab = signal<TabType>('users');
  public roleFilter = signal<RoleFilter>('ALL');
  public statusFilter = signal<StatusFilter>('ALL');
  public currentPage = signal<number>(1);
  public pageSize = 5;

  // Mock activity logs
  public activityLogs = [
    { id: '1', userName: 'Jean Dupont', userInitials: 'JD', action: 'a modifie le role de Marie Curie en Gestionnaire', timestamp: 'Il y a 2 heures', type: 'info', typeLabel: 'Modification' },
    { id: '2', userName: 'Admin System', userInitials: 'AS', action: 'a desactive le compte de Thomas Martin', timestamp: 'Il y a 5 heures', type: 'warning', typeLabel: 'Suspension' },
    { id: '3', userName: 'Marie Curie', userInitials: 'MC', action: 's\'est connectee depuis une nouvelle adresse IP', timestamp: 'Hier a 14:30', type: 'info', typeLabel: 'Connexion' },
    { id: '4', userName: 'Jean Dupont', userInitials: 'JD', action: 'a cree un nouvel utilisateur: Sarah Connor', timestamp: 'Hier a 10:15', type: 'success', typeLabel: 'Creation' },
    { id: '5', userName: 'Admin System', userInitials: 'AS', action: 'a detecte une tentative de connexion echouee pour admin@test.com', timestamp: 'Il y a 2 jours', type: 'error', typeLabel: 'Securite' },
  ];

  // Computed signals
  public filteredUsers = computed(() => {
    let result = this.users();
    const term = this.searchTerm().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();

    if (term) {
      result = result.filter(u =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    if (role !== 'ALL') {
      result = result.filter(u => u.role === role);
    }

    if (status !== 'ALL') {
      if (status === 'ACTIVE') result = result.filter(u => u.isActive);
      else if (status === 'INACTIVE') result = result.filter(u => !u.isActive && !u.isPending);
      else if (status === 'PENDING') result = result.filter(u => u.isPending);
    }

    return result;
  });

  public totalPages = computed(() => Math.ceil(this.filteredUsers().length / this.pageSize));

  public paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  public visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    for (let i = 1; i <= Math.min(total, 3); i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.usersService.getAllUsers().subscribe({
      next: (data) => {
        // Add mock isPending property for demo
        const usersWithPending = data.map((u, i) => ({ ...u, isPending: i === 3, avatarUrl: null }));
        this.users.set(usersWithPending as any);
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
    this.currentPage.set(1);
  }

  updateRoleFilter(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.roleFilter.set(target.value as RoleFilter);
    this.currentPage.set(1);
  }

  updateStatusFilter(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.statusFilter.set(target.value as StatusFilter);
    this.currentPage.set(1);
  }

  getRoleCount(role: string): number {
    return this.users().filter(u => u.role === role).length;
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  openAddUserModal() {
    alert('Ouverture du formulaire d\'ajout utilisateur');
  }

  editUser(user: AdminUser) {
    alert(`Edition de l'utilisateur: ${user.firstName} ${user.lastName}`);
  }

  toggleStatus(userId: string, currentlyActive: boolean) {
    const action = currentlyActive ? 'suspendre' : 'reactiver';
    if (confirm(`Etes-vous sur de vouloir ${action} ce compte ?`)) {
      this.usersService.toggleStatus(userId).subscribe({
        next: () => {
          this.users.update(list => list.map(u => u.id === userId ? { ...u, isActive: !currentlyActive } : u));
        },
        error: (err) => {
          alert(err.error?.message || `Erreur lors de l'operation.`);
        }
      });
    }
  }

  exportCsv() {
    const users = this.filteredUsers();
    const headers = ['Nom', 'Prenom', 'Email', 'Role', 'Statut', 'Date creation'];
    const rows = users.map(u => [
      u.lastName,
      u.firstName,
      u.email,
      u.role,
      u.isActive ? 'Actif' : 'Inactif',
      new Date(u.createdAt).toLocaleDateString('fr-FR')
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}

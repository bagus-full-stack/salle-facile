import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stat Card 1 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Réservations (ce mois)</div>
          <div class="text-3xl font-extrabold text-gray-900">124</div>
          <div class="text-green-500 text-sm font-semibold mt-1">↑ +12%</div>
        </div>

        <!-- Stat Card 2 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Revenus (ce mois)</div>
          <div class="text-3xl font-extrabold text-gray-900">4,250 €</div>
          <div class="text-green-500 text-sm font-semibold mt-1">↑ +5%</div>
        </div>

        <!-- Stat Card 3 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Nouveaux clients</div>
          <div class="text-3xl font-extrabold text-gray-900">18</div>
          <div class="text-red-500 text-sm font-semibold mt-1">↓ -2%</div>
        </div>

        <!-- Stat Card 4 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Salles actives</div>
          <div class="text-3xl font-extrabold text-gray-900">8/10</div>
          <div class="text-gray-400 text-sm font-semibold mt-1">2 en maintenance</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center py-20">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Bienvenue sur votre tableau de bord</h3>
        <p class="text-gray-500">Sélectionnez un module dans le menu latéral pour commencer à gérer votre plateforme.</p>
      </div>
    </div>
  `
})
export class AdminDashboardPageComponent {}


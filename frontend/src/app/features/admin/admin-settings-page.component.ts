import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Paramètres de la plateforme</h1>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl">
        <h2 class="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Configuration Générale (Bientôt disponible)</h2>

        <div class="space-y-6 opacity-60 pointer-events-none">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nom de l'entreprise</label>
            <input type="text" value="SalleFacile" class="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Email de contact</label>
            <input type="email" value="contact@sallefacile.com" class="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50">
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" checked class="w-5 h-5 rounded border-gray-300 text-[#1da1f2]">
            <label class="font-medium text-gray-700">Activer les réservations automatiques</label>
          </div>

          <button class="bg-gray-300 text-white font-bold py-2.5 px-6 rounded-lg cursor-not-allowed">Enregistrer les modifications</button>
        </div>
      </div>
    </div>
  `
})
export class AdminSettingsPageComponent {}


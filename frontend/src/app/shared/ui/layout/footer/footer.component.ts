import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-gray-900 text-white pt-12 pb-8 border-t border-gray-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          <!-- Colonne 1 : Brand -->
          <div class="col-span-1 md:col-span-1">
            <a routerLink="/" class="text-2xl font-extrabold text-white tracking-tighter mb-4 block">
              Salle<span class="text-[#1da1f2]">Facile</span>.
            </a>
            <p class="text-gray-400 text-sm leading-relaxed">
              La plateforme de référence pour réserver vos espaces de travail, réunions et événements en toute simplicité.
            </p>
          </div>

          <!-- Colonne 2 : Liens -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Navigation</h3>
            <ul class="space-y-3">
              <li><a routerLink="/" class="text-gray-300 hover:text-white text-sm transition">Accueil</a></li>
              <li><a routerLink="/salles/1" class="text-gray-300 hover:text-white text-sm transition">Toutes les salles</a></li>
              <li><a routerLink="/mon-espace" class="text-gray-300 hover:text-white text-sm transition">Mon compte</a></li>
            </ul>
          </div>

          <!-- Colonne 3 : Support -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Support</h3>
            <ul class="space-y-3">
              <li><a routerLink="/" class="text-gray-300 hover:text-white text-sm transition">Centre d'aide</a></li>
              <li><a routerLink="/" class="text-gray-300 hover:text-white text-sm transition">Conditions générales</a></li>
              <li><a routerLink="/" class="text-gray-300 hover:text-white text-sm transition">Confidentialité</a></li>
            </ul>
          </div>

          <!-- Colonne 4 : Newsletter -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Restez informé</h3>
            <div class="flex gap-2">
              <input type="email" placeholder="Votre email" class="bg-gray-800 border-none text-white text-sm rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-[#1da1f2]">
              <button class="bg-[#1da1f2] hover:bg-blue-500 text-white rounded-lg px-4 py-2 transition">
                OK
              </button>
            </div>
          </div>

        </div>

        <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {{ currentYear }} SalleFacile. Tous droits réservés.</p>
          <div class="flex gap-4 mt-4 md:mt-0">
            <a href="#" class="hover:text-white transition">Twitter</a>
            <a href="#" class="hover:text-white transition">LinkedIn</a>
            <a href="#" class="hover:text-white transition">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}


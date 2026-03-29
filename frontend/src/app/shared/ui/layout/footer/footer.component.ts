import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          <!-- Colonne 1 : Brand & Description -->
          <div class="space-y-4">
            <a routerLink="/" class="text-2xl font-extrabold text-white tracking-tighter block">
<!--              <div class="bg-[#2b5e6e] p-2 rounded text-white flex-shrink-0">-->
<!--                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>-->
<!--              </div>-->
              Salle<span class="text-[#1da1f2]">Facile</span>.
            </a>
            <p class="text-gray-400 text-sm leading-relaxed">
              La plateforme de référence pour réserver vos espaces de travail, réunions et événements en toute simplicité.
            </p>
          </div>

          <!-- Colonne 2 : Coordonnées (Adresse) -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Nous trouver</h3>
            <ul class="space-y-4 text-sm text-gray-400">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-[#1da1f2] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>
                  10 Rue de la Paix<br>
                  75002 Paris, France
                </span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#1da1f2] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <a href="mailto:contact@sallefacile.com" class="hover:text-white transition">contact&#64;sallefacile.com</a>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#1da1f2] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <a href="tel:+33123456789" class="hover:text-white transition">+33 1 23 45 67 89</a>
              </li>
            </ul>
          </div>

          <!-- Colonne 3 : Liens Rapides -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Liens Rapides</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a routerLink="/" class="hover:text-white transition">Accueil</a></li>
              <li><a routerLink="/salles/1" class="hover:text-white transition">Nos salles</a></li>
              <li><a routerLink="/mon-espace" class="hover:text-white transition">Mon compte</a></li>
              <li class="pt-2 mt-2 border-t border-gray-800"><a href="#" class="hover:text-white transition">Conditions générales</a></li>
              <li><a href="#" class="hover:text-white transition">Confidentialité</a></li>
            </ul>
          </div>

          <!-- Colonne 4 : Newsletter -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Newsletter</h3>
            <p class="text-gray-400 text-sm mb-4">Restez informé de nos nouveautés.</p>
            <div class="flex flex-col gap-3">
              <input type="email" placeholder="Votre email" class="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-[#1da1f2] focus:border-transparent outline-none transition">
              <button class="bg-[#1da1f2] hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2.5 transition w-full">
                OK
              </button>
            </div>
          </div>

        </div>

        <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p class="text-gray-500">&copy; {{ currentYear }} SalleFacile. Tous droits réservés.</p>
          <div class="flex gap-6 mt-4 md:mt-0">
            <a href="#" class="text-gray-500 hover:text-white transition" aria-label="Twitter">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
            </a>
            <a href="#" class="text-gray-500 hover:text-white transition" aria-label="LinkedIn">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd"/></svg>
            </a>
            <a href="#" class="text-gray-500 hover:text-white transition" aria-label="Instagram">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 3.808-.06h.63zm2.595 17h-5.82c-3.217 0-4.33-1.114-4.33-4.332v-5.336c0-3.217 1.113-4.331 4.33-4.331h5.82c3.217 0 4.331 1.114 4.331 4.331v5.336c0 3.217-1.114 4.331-4.331 4.331zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.956a3.044 3.044 0 100 6.088 3.044 3.044 0 000-6.088zM18.156 5.844a1.282 1.282 0 11-2.563 0 1.282 1.282 0 012.563 0z" clip-rule="evenodd"/></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}


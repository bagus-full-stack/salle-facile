import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../core/services/room.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="font-sans bg-white min-h-screen">

      <section class="max-w-7xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div class="space-y-8">
          <div class="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Nouveau <span class="text-blue-400 font-normal normal-case tracking-normal ml-2">Recherche avancée disponible</span>
          </div>

          <h1 class="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Simplifiez la gestion de vos espaces de réunion
          </h1>

          <p class="text-lg text-gray-600 leading-relaxed max-w-lg">
            Une plateforme unique pour réserver, gérer et optimiser vos salles de conférence en toute simplicité.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <a routerLink="/salles" class="bg-[#0b648f] hover:bg-[#084a6b] text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition text-center">
              Voir les salles
            </a>
            <button class="bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 transition shadow-sm">
              Découvrir nos solutions
            </button>
          </div>
        </div>

        <div class="relative hidden lg:block">
          <div class="rounded-3xl overflow-hidden shadow-2xl relative">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" alt="Salle de réunion" class="w-full h-auto object-cover aspect-[4/3]">
            <div class="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex items-center gap-4">
              <div class="bg-green-100 p-2 rounded-lg text-green-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-bold uppercase tracking-wider">Statut</p>
                <p class="font-bold text-gray-900">Espaces disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="max-w-5xl mx-auto px-4 relative z-20 lg:-mt-12 mb-8 lg:mb-0">
        <div class="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">

          <div class="flex flex-col md:border-r pr-4">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mot-clé</label>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="updateSearch($event)"
              placeholder="Nom, mot-clé..."
              class="text-sm font-semibold outline-none py-1 text-gray-900 placeholder-gray-400">
          </div>

          <div class="flex flex-col md:border-r md:px-4">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Catégorie</label>
            <select
              [value]="selectedCategory()"
              (change)="updateCategory($event)"
              class="text-sm font-semibold outline-none py-1 bg-transparent text-gray-900 cursor-pointer">
              <option value="">Toutes les catégories</option>
              <option value="MEETING">Réunion</option>
              <option value="STUDIO">Studio</option>
              <option value="EVENT">Événementiel</option>
            </select>
          </div>

          <div class="flex flex-col md:border-r md:px-4">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Capacité Min.</label>
            <div class="flex items-center gap-2">
              <span class="text-gray-400 text-sm">👥</span>
              <input
                type="number"
                min="1"
                [value]="minCapacity()"
                (input)="updateCapacity($event)"
                class="text-sm font-semibold outline-none py-1 w-full text-gray-900">
            </div>
          </div>

          <button
            (click)="applyFilters()"
            class="bg-[#1da1f2] hover:bg-blue-500 text-white rounded-xl font-bold py-3 px-4 transition shadow-sm flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Rechercher
          </button>
        </div>
      </div>

      <section class="bg-gray-50 pt-20 pb-20 -mt-10 lg:pt-32 lg:-mt-24">
        <div class="max-w-7xl mx-auto px-4">

          <div class="flex justify-between items-end mb-10">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Espaces Disponibles</h2>
              <p class="text-gray-500">Trouvez l'environnement parfait pour votre prochain événement.</p>
            </div>
          </div>

          @if (roomService.isListLoading()) {
            <div class="flex justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1da1f2]"></div>
            </div>
          } @else {

            @if (roomService.roomsList().length === 0) {
              <div class="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div class="text-5xl mb-4">📭</div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Aucune salle trouvée</h3>
                <p class="text-gray-500 mb-6">Essayez de modifier vos critères de recherche pour voir plus de résultats.</p>
                <button (click)="resetFilters()" class="text-[#1da1f2] font-semibold hover:underline">Effacer les filtres</button>
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              @for (room of roomService.roomsList(); track room.id) {
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col">

                  <div class="h-56 bg-gray-200 relative overflow-hidden">
                    <img [src]="room.images[0]?.url || 'https://images.unsplash.com/photo-1517502884422-41ea209c1b4e?auto=format&fit=crop&q=80&w=800'" [alt]="room.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <span class="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {{ room.category === 'MEETING' ? 'Réunion' : room.category === 'STUDIO' ? 'Studio' : 'Événement' }}
                    </span>
                  </div>

                  <div class="p-6 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-3">
                      <h3 class="font-bold text-xl text-gray-900 leading-tight">{{ room.name }}</h3>
                      <span class="bg-blue-50 text-[#0b648f] text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shrink-0">
                        👥 {{ room.capacity }} max
                      </span>
                    </div>

                    <p class="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{{ room.description }}</p>

                    @if (room.equipments && room.equipments.length > 0) {
                      <div class="flex flex-wrap gap-2 mb-6">
                        @for (eq of room.equipments.slice(0, 3); track eq.id) {
                          <span class="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 flex items-center gap-1">
                            <span class="text-[#1da1f2]">•</span> {{ eq.name }}
                          </span>
                        }
                      </div>
                    }

                    <div class="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                      <div>
                        <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-0.5">À partir de</span>
                        <span class="font-extrabold text-[#0b648f] text-lg">{{ room.hourlyPrice }}€ <span class="text-xs text-gray-500 font-normal">/heure</span></span>
                      </div>
                      <a [routerLink]="['/salles', room.id]" class="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg transition text-sm">
                        Détails
                      </a>
                    </div>
                  </div>

                </div>
              }
            </div>
          }
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">L'excellence au service de vos événements</h2>
        <p class="text-gray-500 max-w-2xl mx-auto mb-16">Nous optimisons chaque étape de la gestion de vos espaces pour vous faire gagner un temps précieux.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div class="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition duration-300 border border-transparent hover:border-gray-100">
            <div class="w-12 h-12 bg-[#1da1f2]/10 text-[#1da1f2] rounded-xl flex items-center justify-center mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Disponibilité en temps réel</h3>
            <p class="text-gray-500 leading-relaxed text-sm">Visualisez instantanément les créneaux libres de toutes vos salles. Plus de doubles réservations ni d'appels inutiles.</p>
          </div>

          <div class="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition duration-300 border border-transparent hover:border-gray-100">
            <div class="w-12 h-12 bg-[#1da1f2]/10 text-[#1da1f2] rounded-xl flex items-center justify-center mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Réservation en 3 clics</h3>
            <p class="text-gray-500 leading-relaxed text-sm">Une interface fluide et intuitive pensée pour l'efficacité. Réservez votre espace, commandez vos options et réglez en moins d'une minute.</p>
          </div>

          <div class="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition duration-300 border border-transparent hover:border-gray-100">
            <div class="w-12 h-12 bg-[#1da1f2]/10 text-[#1da1f2] rounded-xl flex items-center justify-center mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Paiement 100% sécurisé</h3>
            <p class="text-gray-500 leading-relaxed text-sm">Facturation automatisée, cryptage des données bancaires et historique accessible à tout moment dans votre espace personnel.</p>
          </div>
        </div>
      </section>

      <footer class="bg-gray-900 text-white py-12 mt-auto">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-1 md:col-span-1">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-[#1da1f2] rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <h3 class="text-xl font-bold">SalleFacile</h3>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              La solution tout-en-un pour la réservation et la gestion de vos espaces professionnels. Simple, rapide et sécurisé.
            </p>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-4 text-[#1da1f2]">Navigation</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a routerLink="/" class="hover:text-white transition-colors duration-200 flex items-center gap-2"><span>→</span> Accueil</a></li>
              <li><a routerLink="/salles" class="hover:text-white transition-colors duration-200 flex items-center gap-2"><span>→</span> Nos Salles</a></li>
              <li><a routerLink="/login" class="hover:text-white transition-colors duration-200 flex items-center gap-2"><span>→</span> Connexion / Inscription</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-4 text-[#1da1f2]">Informations</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors duration-200">Mentions légales</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Politique de confidentialité</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Conditions Générales de Vente</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-4 text-[#1da1f2]">Nous contacter</h4>
            <ul class="space-y-3 text-sm text-gray-400">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>123 Avenue de l'Innovation<br>75001 Paris, France</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <a href="mailto:contact&#64;sallefacile.com" class="hover:text-white transition">contact&#64;sallefacile.com</a>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span>+33 1 23 45 67 89</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {{ currentYear }} SalleFacile. Tous droits réservés.</p>
          <div class="flex gap-4">
            <a href="#" class="hover:text-white transition"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
            <a href="#" class="hover:text-white transition"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a href="#" class="hover:text-white transition"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class HomePageComponent implements OnInit {
  public roomService = inject(RoomService);
  public currentYear = new Date().getFullYear();

  // État local des filtres de recherche via Signals
  public searchQuery = signal<string>('');
  public selectedCategory = signal<string>('');
  public minCapacity = signal<number>(1);

  ngOnInit() {
    // Charge toutes les salles par défaut au démarrage
    this.roomService.loadRooms();
  }

  // Méthodes pour mettre à jour les signaux locaux à chaque frappe/changement
  updateSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  updateCategory(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value);
  }

  updateCapacity(event: Event) {
    const target = event.target as HTMLInputElement;
    this.minCapacity.set(Number(target.value) || 1);
  }

  // Déclenche l'appel réseau vers le backend avec les filtres actuels
  applyFilters() {
    this.roomService.loadRooms({
      category: this.selectedCategory() || undefined,
      minCapacity: this.minCapacity() > 1 ? this.minCapacity() : undefined,
      search: this.searchQuery() || undefined
    });
  }

  // Réinitialise la vue et recharge tout
  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.minCapacity.set(1);
    this.roomService.loadRooms();
  }
}

import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../core/services/room.service';

@Component({
  selector: 'app-rooms-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="font-sans bg-white min-h-screen">
      <!-- En-tête -->
      <section class="max-w-7xl mx-auto px-4 py-16 lg:py-20">
        <div class="mb-12">
          <h1 class="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Nos Salles et Espaces
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl">
            Explorez notre large gamme d'espaces de réunion, studios et lieux d'événementiel pour trouver l'environnement parfait.
          </p>
        </div>

        <!-- Barre de recherche et filtres -->
        <div class="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">

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
      </section>

      <!-- Liste des salles -->
      <section class="max-w-7xl mx-auto px-4 pb-20">

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
          } @else {
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
        }
      </section>
    </div>
  `
})
export class RoomsListPageComponent implements OnInit {
  public roomService = inject(RoomService);

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


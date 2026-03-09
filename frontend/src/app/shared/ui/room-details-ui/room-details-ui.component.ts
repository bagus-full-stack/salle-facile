import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Room } from '../../../core/services/room.service';

@Component({
  selector: 'app-room-details-ui',
  standalone: true,
  imports: [CommonModule],
  // ⚡️ Optimisation extrême des performances
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen">

      <div class="mb-8">
        <div class="text-sm text-gray-500 mb-3 tracking-wide">Accueil > Salles > <span class="font-medium text-gray-900">{{ room.name }}</span></div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ room.name }}</h1>
        <p class="text-gray-600 text-lg">Idéale pour réunions créatives et ateliers collaboratifs</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 flex flex-col gap-4">
          <div class="w-full h-[450px] rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
            <img [src]="room.images[0]?.url" alt="Vue principale" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="grid grid-cols-4 gap-4 h-28">
            @for (img of room.images.slice(1, 5); track img.id) {
              <div class="rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm relative group">
                <img [src]="img.url" class="w-full h-full object-cover">
                @if ($last) {
                  <div class="absolute inset-0 bg-slate-800/60 flex items-center justify-center text-white font-medium">
                    +5 photos
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <div class="lg:col-span-1 flex flex-col gap-6">

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4 text-gray-900">Description et Attributs</h2>
            <p class="text-gray-600 text-sm mb-6 leading-relaxed">{{ room.description }}</p>

            <div class="grid grid-cols-2 gap-4 mb-6 border-y border-gray-100 py-4">
              <div class="flex items-center gap-3">
                <div class="text-gray-400 text-xl">👥</div>
                <div>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Capacité</p>
                  <p class="font-medium text-gray-900">{{ room.capacity }} personnes</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-gray-400 text-xl">🏢</div>
                <div>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Catégorie</p>
                  <p class="font-medium text-gray-900">{{ room.category }}</p>
                </div>
              </div>
            </div>

            <h3 class="font-bold text-gray-900 mb-3 text-sm">Équipements inclus:</h3>
            <ul class="space-y-3 text-sm text-gray-600">
              @for (eq of room.equipments; track eq.id) {
                <li class="flex items-center gap-3">
                  <span class="text-gray-400 border border-gray-200 rounded p-1">✓</span>
                  {{ eq.name }}
                </li>
              }
            </ul>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-6 text-gray-900">Tarification</h2>

            <div class="space-y-4 mb-8">
              <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <span class="text-gray-600">Par heure:</span>
                <span class="font-bold text-blue-500 text-base">{{ room.hourlyPrice }}€</span>
              </div>
              <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <span class="text-gray-600">Demi-journée (4h):</span>
                <span class="font-bold text-blue-500 text-base">{{ room.halfDayPrice }}€</span>
              </div>
              <div class="flex justify-between items-center text-sm pb-1">
                <span class="text-gray-600">Journée complète (8h):</span>
                <span class="font-bold text-blue-500 text-base">{{ room.fullDayPrice }}€</span>
              </div>
            </div>

            <button (click)="reserveRoom()" class="w-full bg-[#1da1f2] hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm">
              Réserver cette salle
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class RoomDetailsUiComponent {
  private router = inject(Router);

  // Le Smart Component passera l'objet Room ici
  @Input({ required: true }) room!: Room;

  reserveRoom() {
    this.router.navigate(['/checkout'], { state: { room: this.room } });
  }
}

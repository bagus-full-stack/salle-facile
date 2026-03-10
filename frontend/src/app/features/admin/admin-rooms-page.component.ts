import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService, Room } from '../../core/services/room.service';

interface AvailabilitySlot {
  roomName: string;
  slots: { time: string; status: 'free' | 'reserved' | 'maintenance' }[];
}

@Component({
  selector: 'app-admin-rooms-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900">Gestion des Salles</h1>
          <p class="text-gray-500 mt-1">Gerez vos espaces, leur disponibilite et leurs tarifs.</p>
        </div>
        <a routerLink="/admin/salles/edition" 
           class="bg-[#1da1f2] text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-[#0b648f] transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Ajouter une nouvelle salle
        </a>
      </div>

      <!-- Filters & Planning Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Check Availability Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Verifier la disponibilite
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" 
                     [value]="selectedDate()"
                     (change)="onDateChange($event)"
                     class="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1da1f2] outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Debut</label>
                <select class="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1da1f2] outline-none">
                  <option>08:00</option>
                  <option selected>10:00</option>
                  <option>12:00</option>
                  <option>14:00</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                <select class="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1da1f2] outline-none">
                  <option>10:00</option>
                  <option selected>12:00</option>
                  <option>14:00</option>
                  <option>18:00</option>
                </select>
              </div>
            </div>
            <button class="w-full bg-[#1da1f2] text-white py-2.5 rounded-lg font-semibold hover:bg-[#0b648f] transition flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Rechercher
            </button>
            <div class="flex gap-4 text-xs pt-2">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 bg-green-100 border border-green-300 rounded"></span> Libre
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 bg-red-100 border border-red-300 rounded"></span> Reserve
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></span> Maintenance
              </span>
            </div>
          </div>
        </div>

        <!-- Planning Timeline -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-900">Planning des Disponibilites - Aujourd'hui</h3>
            <div class="flex items-center gap-2">
              <button (click)="previousDay()" class="p-1 hover:bg-gray-100 rounded transition">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <span class="text-sm font-medium text-gray-700">{{ formattedDate() }}</span>
              <button (click)="nextDay()" class="p-1 hover:bg-gray-100 rounded transition">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr>
                  <th class="text-left py-2 pr-4 text-gray-500 font-medium w-24"></th>
                  @for (hour of timeSlots; track hour) {
                    <th class="text-center py-2 px-1 text-gray-500 font-medium text-xs">{{ hour }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (room of availabilityData(); track room.roomName) {
                  <tr class="border-t border-gray-100">
                    <td class="py-3 pr-4 font-semibold text-gray-900 text-xs">{{ room.roomName }}</td>
                    @for (slot of room.slots; track slot.time) {
                      <td class="py-3 px-0.5">
                        <div class="h-8 rounded text-[10px] font-medium flex items-center justify-center"
                             [ngClass]="{
                               'bg-green-100 text-green-700': slot.status === 'free',
                               'bg-red-100 text-red-600': slot.status === 'reserved',
                               'bg-gray-200 text-gray-500': slot.status === 'maintenance'
                             }">
                          @if (slot.status === 'reserved') { Reserve }
                          @else if (slot.status === 'maintenance') { Maint. }
                        </div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Rooms Grid -->
      @if (roomService.isListLoading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1da1f2]"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (room of roomService.roomsList(); track room.id) {
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
              <!-- Image -->
              <div class="relative h-48 bg-gray-100">
                @if (room.images && room.images.length > 0) {
                  <img [src]="room.images[0].url" [alt]="room.name" class="w-full h-full object-cover">
                } @else {
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                }
                <!-- Next availability badge -->
                <div class="absolute top-3 right-3">
                  <span class="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Prochain creneau: Disponible
                  </span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-5">
                <h3 class="text-lg font-bold text-gray-900 mb-2">{{ room.name }}</h3>
                <p class="text-sm text-gray-500 line-clamp-2 mb-4">{{ room.description }}</p>

                <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Capacite: {{ room.capacity }}
                  </span>
                  <span class="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded">
                    {{ getCategoryLabel(room.category) }}
                  </span>
                </div>

                <div class="flex items-center text-sm text-gray-600 mb-5">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Tarif journalier: <span class="font-bold text-gray-900 ml-1">{{ room.fullDayPrice }} EUR</span>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                  <a [routerLink]="['/admin/salles/edition', room.id]" 
                     class="flex-1 text-center py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Modifier
                  </a>
                  <button (click)="deleteRoom(room.id, room.name)" 
                          class="px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Empty State -->
        @if (roomService.roomsList().length === 0) {
          <div class="text-center py-16">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Aucune salle configuree</h3>
            <p class="text-gray-500 mb-6">Commencez par ajouter votre premiere salle de conference.</p>
            <a routerLink="/admin/salles/edition" class="inline-flex items-center gap-2 bg-[#1da1f2] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0b648f] transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Ajouter une salle
            </a>
          </div>
        }

        <!-- Pagination -->
        @if (roomService.roomsList().length > 0) {
          <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <span class="text-sm text-gray-500">
              Affichage de 1 a {{ roomService.roomsList().length }} sur {{ roomService.roomsList().length }} resultats
            </span>
            <div class="flex gap-2">
              <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">
                Precedent
              </button>
              <button class="px-4 py-2 bg-[#1da1f2] text-white rounded-lg text-sm font-bold">1</button>
              <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">2</button>
              <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">3</button>
              <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Suivant
              </button>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class AdminRoomsPageComponent implements OnInit {
  public roomService = inject(RoomService);
  
  public selectedDate = signal(new Date().toISOString().split('T')[0]);
  public timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Mock availability data - should come from API
  public availabilityData = signal<AvailabilitySlot[]>([
    {
      roomName: 'Alpha',
      slots: [
        { time: '08:00', status: 'free' },
        { time: '09:00', status: 'reserved' },
        { time: '10:00', status: 'reserved' },
        { time: '11:00', status: 'free' },
        { time: '12:00', status: 'free' },
        { time: '13:00', status: 'maintenance' },
        { time: '14:00', status: 'maintenance' },
        { time: '15:00', status: 'free' },
        { time: '16:00', status: 'free' },
        { time: '17:00', status: 'free' },
        { time: '18:00', status: 'free' }
      ]
    },
    {
      roomName: 'Focus',
      slots: [
        { time: '08:00', status: 'free' },
        { time: '09:00', status: 'free' },
        { time: '10:00', status: 'reserved' },
        { time: '11:00', status: 'reserved' },
        { time: '12:00', status: 'free' },
        { time: '13:00', status: 'free' },
        { time: '14:00', status: 'free' },
        { time: '15:00', status: 'free' },
        { time: '16:00', status: 'free' },
        { time: '17:00', status: 'free' },
        { time: '18:00', status: 'free' }
      ]
    },
    {
      roomName: 'Zenith',
      slots: [
        { time: '08:00', status: 'free' },
        { time: '09:00', status: 'free' },
        { time: '10:00', status: 'free' },
        { time: '11:00', status: 'free' },
        { time: '12:00', status: 'free' },
        { time: '13:00', status: 'free' },
        { time: '14:00', status: 'free' },
        { time: '15:00', status: 'free' },
        { time: '16:00', status: 'free' },
        { time: '17:00', status: 'free' },
        { time: '18:00', status: 'free' }
      ]
    },
    {
      roomName: 'Pixel',
      slots: [
        { time: '08:00', status: 'free' },
        { time: '09:00', status: 'free' },
        { time: '10:00', status: 'free' },
        { time: '11:00', status: 'reserved' },
        { time: '12:00', status: 'reserved' },
        { time: '13:00', status: 'reserved' },
        { time: '14:00', status: 'reserved' },
        { time: '15:00', status: 'reserved' },
        { time: '16:00', status: 'reserved' },
        { time: '17:00', status: 'reserved' },
        { time: '18:00', status: 'reserved' }
      ]
    }
  ]);

  public formattedDate = computed(() => {
    const date = new Date(this.selectedDate());
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  });

  ngOnInit() {
    this.roomService.loadRooms();
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
  }

  previousDay() {
    const current = new Date(this.selectedDate());
    current.setDate(current.getDate() - 1);
    this.selectedDate.set(current.toISOString().split('T')[0]);
  }

  nextDay() {
    const current = new Date(this.selectedDate());
    current.setDate(current.getDate() + 1);
    this.selectedDate.set(current.toISOString().split('T')[0]);
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'MEETING': 'Salle de reunion',
      'STUDIO': 'Studio',
      'EVENT': 'Espace evenementiel',
      'PRIVATE': 'Bureau prive'
    };
    return labels[category] || category;
  }

  deleteRoom(id: string, name: string) {
    if (confirm(`Etes-vous sur de vouloir supprimer la salle "${name}" ?\nCette action est irreversible.`)) {
      // TODO: Call delete API
      console.log('Delete room:', id);
    }
  }
}

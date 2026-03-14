import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-rooms-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <div class="flex justify-between items-end mb-8">
        <div>
          <div class="text-sm text-[#1da1f2] font-semibold mb-1">Dashboard / Salles</div>
          <h1 class="text-3xl font-extrabold text-gray-900">Catalogue des Salles</h1>
          <p class="text-gray-500 mt-1">Gérez vos espaces, leurs prix et leur disponibilité.</p>
        </div>

        <button class="bg-[#0b648f] hover:bg-[#084a6b] text-white font-bold py-2.5 px-6 rounded-xl transition shadow-sm flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nouvelle Salle
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        @if (isLoading()) {
          <div class="flex justify-center items-center h-48">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1da1f2]"></div>
          </div>
        } @else {
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th class="px-6 py-4">Espace</th>
                <th class="px-6 py-4">Catégorie</th>
                <th class="px-6 py-4">Tarification</th>
                <th class="px-6 py-4">Statut</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-gray-700">

              @for (room of rooms(); track room.id) {
                <tr class="hover:bg-gray-50 transition" [class.opacity-50]="!room.isActive">

                  <td class="px-6 py-4">
                    <div class="font-bold text-gray-900 flex items-center gap-4">
                      <div class="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        <img [src]="room.images?.[0]?.url || 'assets/placeholder-room.jpg'" class="w-full h-full object-cover">
                      </div>
                      <div>
                        <div class="text-base">{{ room.name }}</div>
                        <div class="text-xs text-gray-500 font-normal">👥 {{ room.capacity }} personnes max.</div>
                      </div>
                    </div>
                  </td>

                  <td class="px-6 py-4 font-semibold">
                    {{ room.category === 'MEETING' ? 'Réunion' : room.category === 'STUDIO' ? 'Studio' : 'Événement' }}
                  </td>

                  <td class="px-6 py-4">
                    <div class="font-bold text-[#0b648f]">{{ room.hourlyPrice }}€ <span class="text-xs text-gray-400 font-normal">/h</span></div>
                    <div class="text-xs text-gray-500">{{ room.fullDayPrice }}€ /jour</div>
                  </td>

                  <td class="px-6 py-4">
                    @if (room.isActive) {
                      <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex w-max items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> En ligne
                      </span>
                    } @else {
                      <span class="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full flex w-max items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Hors ligne
                      </span>
                    }
                  </td>

                  <td class="px-6 py-4 text-right">
                    <button class="text-[#1da1f2] hover:bg-blue-50 p-2 rounded-lg transition mr-2" title="Modifier">
                      ✏️
                    </button>
                    <button
                      (click)="toggleRoomStatus(room.id, room.isActive)"
                      class="text-sm font-bold px-3 py-1.5 rounded transition shadow-sm border"
                      [ngClass]="room.isActive ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'">
                      {{ room.isActive ? 'Masquer' : 'Publier' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `
})
export class AdminRoomsPageComponent implements OnInit {
  private http = inject(HttpClient);

  public rooms = signal<any[]>([]);
  public isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading.set(true);
    // On récupère toutes les salles (même inactives) pour l'admin
    this.http.get<any[]>('http://localhost:3000/rooms').subscribe({
      next: (data) => {
        this.rooms.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleRoomStatus(roomId: string, currentStatus: boolean) {
    if (confirm(`Voulez-vous ${currentStatus ? 'masquer' : 'publier'} cette salle ?`)) {
      this.http.patch(`http://localhost:3000/rooms/${roomId}`, { isActive: !currentStatus }).subscribe({
        next: () => {
          // Mise à jour optimiste de l'UI
          this.rooms.update(list => list.map(r => r.id === roomId ? { ...r, isActive: !currentStatus } : r));
        },
        error: () => alert("Erreur lors de la modification du statut.")
      });
    }
  }
}

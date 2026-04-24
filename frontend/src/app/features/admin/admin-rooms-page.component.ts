import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RoomService } from '../../core/services/room.service';

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

        <a routerLink="/admin/salles/nouveau" class="bg-[#0b648f] hover:bg-[#084a6b] text-white font-bold py-2.5 px-6 rounded-xl transition shadow-sm flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nouvelle Salle
        </a>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-48">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1da1f2]"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (room of rooms(); track room.id) {
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition group relative">

              <!-- Image Area -->
              <div class="h-48 bg-gray-200 relative overflow-hidden">
                <img [src]="getRoomImage(room)" alt="{{ room.name }}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105">

                <!-- Badge Category -->
                <span class="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  {{ getCategoryLabel(room.category) }}
                </span>

                <!-- Status Badge (Optional overlay) -->
                 @if (!room.isActive) {
                  <div class="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <span class="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Hors Ligne</span>
                  </div>
                 }
              </div>

              <!-- Content Area -->
              <div class="p-5 flex-1 flex flex-col">
                <h3 class="text-lg font-bold text-gray-900 mb-1 line-clamp-1" [title]="room.name">{{ room.name }}</h3>
                <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ room.description || 'Aucune description disponible pour cette salle.' }}</p>

                <!-- Metadata -->
                <div class="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Capacité: {{ room.capacity }}
                  </span>
                </div>

                <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <div>
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Tarif journalier</p>
                    <p class="text-lg font-bold text-[#0b648f]">{{ room.fullDayPrice }} €</p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                  <a [routerLink]="['/admin/salles/edition', room.id]" class="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition" title="Modifier">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Modifier
                  </a>

                  <button (click)="toggleRoomStatus(room.id, room.isActive)" class="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-xs font-bold rounded-lg transition" [ngClass]="room.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'" [title]="room.isActive ? 'Masquer la salle' : 'Publier la salle'">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      @if(room.isActive) {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      } @else {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      }
                    </svg>
                    {{ room.isActive ? 'Masquer' : 'Publier' }}
                  </button>

                  <button (click)="deleteRoom(room.id)" class="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition" title="Supprimer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Supprimer
                  </button>
                </div>

                <a
                  [routerLink]="['/admin/salles', room.id, 'indisponibilites']"
                  class="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition"
                  title="Bloquer des créneaux"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14M12 5a7 7 0 100 14 7 7 0 000-14z"></path></svg>
                  Bloquer des créneaux
                </a>

              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AdminRoomsPageComponent implements OnInit {
  private http = inject(HttpClient);
  private roomService = inject(RoomService);

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

  getRoomImage(room: any): string {
    return room.images?.[0]?.url
      ? (room.images[0].url.startsWith('http') ? room.images[0].url : 'http://localhost:3000' + room.images[0].url)
      : 'assets/placeholder-room.jpg';
  }

  getCategoryLabel(category: string): string {
    switch(category) {
        case 'MEETING': return 'Réunion';
        case 'STUDIO': return 'Studio';
        case 'EVENT': return 'Événementiel';
        default: return category;
    }
  }


  toggleRoomStatus(roomId: string, currentStatus: boolean) {
    if (confirm(`Voulez-vous ${currentStatus ? 'masquer' : 'publier'} cette salle ?`)) {
      const formData = new FormData();
      formData.append('isActive', String(!currentStatus));

      this.roomService.updateRoom(roomId, formData).subscribe({
        next: () => {
          // Mise à jour optimiste de l'UI
          this.rooms.update(list => list.map(r => r.id === roomId ? { ...r, isActive: !currentStatus } : r));
        },
        error: (err) => {
          console.error('Update status error:', err);
          alert(`Erreur lors de la modification du statut : ${err.error?.message || err.statusText || 'Inconnue'}`);
        }
      });
    }
  }

  deleteRoom(roomId: string) {
    if(confirm('Êtes-vous sûr de vouloir supprimer cette salle définitivement ?')) {
      this.roomService.deleteRoom(roomId).subscribe({
        next: () => {
           this.rooms.update(list => list.filter(r => r.id !== roomId));
        },
        error: (err) => {
          console.error(err);
          alert('Une erreur est survenue lors de la suppression.');
        }
      });
    }
  }
}

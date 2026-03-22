import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RoomAvailabilityCalendarComponent } from '../../shared/ui/room-availability-calendar/room-availability-calendar.component';
import { RoomService } from '../../core/services/room.service';

@Component({
  selector: 'app-admin-room-block-page',
  standalone: true,
  imports: [CommonModule, RouterModule, RoomAvailabilityCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-start justify-between mb-6">
          <div>
            <p class="text-xs uppercase text-gray-500 font-bold">Gestion des indisponibilités</p>
            <h1 class="text-2xl font-extrabold text-gray-900">
              {{ roomService.currentRoom() ? roomService.currentRoom()!.name : 'Chargement de la salle...' }}
            </h1>
            <p class="text-sm text-gray-500" *ngIf="roomService.currentRoom()">Bloquez manuellement des créneaux pour maintenance, fermeture ou événements privés.</p>
          </div>
          <a routerLink="/admin/salles" class="text-sm font-semibold text-[#0b648f] hover:text-[#084a6b]">← Retour aux salles</a>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <app-room-availability-calendar
            *ngIf="roomId()"
            [roomId]="roomId()!"
            [isAdmin]="true"
          ></app-room-availability-calendar>

          <div *ngIf="!roomId()" class="text-red-600 font-semibold">Salle introuvable.</div>
        </div>
      </div>
    </div>
  `
})
export class AdminRoomBlockPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public roomService = inject(RoomService);

  public roomId = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.roomId.set(id);

      if (id) {
        this.roomService.loadRoomDetails(id);
      }
    });
  }
}


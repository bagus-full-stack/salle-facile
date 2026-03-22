import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoomAvailabilityCalendarComponent } from '../../shared/ui/room-availability-calendar/room-availability-calendar.component';
import { RoomService } from '../../core/services/room.service';

@Component({
  selector: 'app-reservation-page',
  standalone: true,
  imports: [CommonModule, RoomAvailabilityCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-10 font-sans bg-gray-50/50 min-h-screen">
      <div class="flex flex-col gap-2 mb-6">
        <p class="text-sm text-gray-500">Parcours de réservation</p>
        <h1 class="text-3xl font-bold text-gray-900">Choisissez vos dates</h1>
        @if (roomService.currentRoom()) {
          <p class="text-gray-600 text-sm">Salle sélectionnée : <span class="font-semibold text-gray-900">{{ roomService.currentRoom()!.name }}</span></p>
        }
      </div>

      @if (!roomId()) {
        <div class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          Aucune salle n'a été fournie. Merci de sélectionner une salle avant de continuer.
        </div>
      } @else if (roomService.isLoading()) {
        <div class="text-gray-500">Chargement des informations de la salle...</div>
      } @else if (roomService.error()) {
        <div class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {{ roomService.error() }}
        </div>
      } @else {
        <app-room-availability-calendar
          [roomId]="roomId()!"
          [hideViewToggle]="true"
        ></app-room-availability-calendar>
      }
    </div>
  `
})
export class ReservationPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public roomService = inject(RoomService);
  public roomId = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['roomId'];
      this.roomId.set(id ?? null);

      if (id) {
        this.roomService.loadRoomDetails(id);
      }
    });
  }
}

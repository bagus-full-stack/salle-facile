import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { RoomDetailsUiComponent } from '../../shared/ui/room-details-ui/room-details-ui.component';
import { RoomAvailabilityCalendarComponent } from '../../shared/ui/room-availability-calendar/room-availability-calendar.component';

@Component({
  selector: 'app-room-details-page',
  standalone: true,
  imports: [CommonModule, RoomDetailsUiComponent, RoomAvailabilityCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (roomService.isLoading()) {
      <div class="flex justify-center items-center h-screen text-gray-500">
        Chargement de la salle...
      </div>
    } @else if (roomService.error()) {
      <div class="text-center text-red-500 mt-20 font-medium">
        {{ roomService.error() }}
      </div>
    } @else if (roomService.currentRoom()) {
      <div class="space-y-8 pb-32">
        <app-room-details-ui [room]="roomService.currentRoom()!"></app-room-details-ui>
        <div class="max-w-7xl mx-auto px-4 pb-16">
          <app-room-availability-calendar [roomId]="roomService.currentRoom()!.id"></app-room-availability-calendar>
        </div>
      </div>
    }
  `
})
export class RoomDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public roomService = inject(RoomService);

  ngOnInit() {
    // On récupère l'ID depuis l'URL (ex: /salles/123e4567-...)
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.roomService.loadRoomDetails(roomId);
    }
  }
}

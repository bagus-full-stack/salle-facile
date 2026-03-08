import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { RoomDetailsUiComponent } from '../../shared/ui/room-details-ui/room-details-ui.component';

@Component({
  selector: 'app-room-details-page',
  standalone: true,
  imports: [CommonModule, RoomDetailsUiComponent],
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
      <app-room-details-ui [room]="roomService.currentRoom()!"></app-room-details-ui>
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

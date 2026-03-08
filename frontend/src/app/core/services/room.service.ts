import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Room {
  id: string;
  name: string;
  description: string;
  category: string;
  capacity: number;
  hourlyPrice: number;
  halfDayPrice: number;
  fullDayPrice: number;
  images: { id: string; url: string; isPrimary: boolean }[];
  equipments: { id: string; name: string; iconRef: string }[];
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/rooms';

  // ⚡️ Gestion de l'état avec les Signals
  public currentRoom = signal<Room | null>(null);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public roomsList = signal<Room[]>([]);
  public isListLoading = signal<boolean>(false);

  loadRoomDetails(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<Room>(`${this.apiUrl}/${id}`).subscribe({
      next: (room) => {
        this.currentRoom.set(room);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Impossible de charger les détails de cette salle.');
        this.currentRoom.set(null);
        this.isLoading.set(false);
      }
    });
  }

  loadRooms(filters?: { category?: string; minCapacity?: number; search?: string }) {
    this.isListLoading.set(true);

    // Construction des query params
    let params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minCapacity) params.append('minCapacity', filters.minCapacity.toString());
    if (filters?.search) params.append('search', filters.search);

    const url = params.toString() ? `${this.apiUrl}?${params.toString()}` : this.apiUrl;

    this.http.get<Room[]>(url).subscribe({
      next: (rooms) => {
        this.roomsList.set(rooms);
        this.isListLoading.set(false);
      },
      error: (err) => {
        console.error("Erreur de chargement des salles", err);
        this.isListLoading.set(false);
      }
    });
  }
}

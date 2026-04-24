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
  private apiBaseUrl = 'http://localhost:3000';

  // ⚡️ Gestion de l'état avec les Signals
  public currentRoom = signal<Room | null>(null);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public roomsList = signal<Room[]>([]);
  public isListLoading = signal<boolean>(false);

  /**
   * 🔧 Transforme les URLs relatives en URLs absolues
   * Ex: /uploads/rooms/room-xxx.jpg → http://localhost:3000/uploads/rooms/room-xxx.jpg
   */
  private buildAbsoluteImageUrls(room: Room): Room {
    return {
      ...room,
      images: room.images.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `${this.apiBaseUrl}${img.url}`
      }))
    };
  }

  /**
   * 🔧 Applique la transformation à une liste de salles
   */
  private buildAbsoluteImageUrlsForList(rooms: Room[]): Room[] {
    return rooms.map(room => this.buildAbsoluteImageUrls(room));
  }

  // Méthodes CRUD Admin
  createRoom(roomData: FormData) {
    return this.http.post<Room>(this.apiUrl, roomData);
  }

  updateRoom(id: string, roomData: FormData) {
    return this.http.patch<Room>(`${this.apiUrl}/${id}`, roomData);
  }

  deleteRoom(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Gestion des images
  uploadRoomImage(roomId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/${roomId}/images`, formData);
  }

  deleteRoomImage(imageId: string) {
    return this.http.delete<void>(`${this.apiUrl}/images/${imageId}`);
  }

  // Récupération des équipements
  getEquipments() {
    return this.http.get<{ id: string; name: string; iconRef: string }[]>(`${this.apiUrl}/admin/equipments`);
  }

  loadRoomDetails(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<Room>(`${this.apiUrl}/${id}`).subscribe({
      next: (room) => {
        this.currentRoom.set(this.buildAbsoluteImageUrls(room));
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
        this.roomsList.set(this.buildAbsoluteImageUrlsForList(rooms));
        this.isListLoading.set(false);
      },
      error: (err) => {
        console.error("Erreur de chargement des salles", err);
        this.isListLoading.set(false);
      }
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Typage strict basé sur ce que renvoie Prisma
export interface AdminReservation {
  id: string;
  reference: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  user: { firstName: string; lastName: string; email: string };
  room: { name: string };
  payment: { status: string; method: string } | null;
}

@Injectable({ providedIn: 'root' })
export class AdminReservationsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/reservations/admin';

  getAll(): Observable<AdminReservation[]> {
    return this.http.get<AdminReservation[]>(`${this.apiUrl}/all`);
  }

  forceCancel(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/force-cancel`, {});
  }

  getTimeline(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/timeline?date=${date}`);
  }
}

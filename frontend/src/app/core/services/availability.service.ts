import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/rooms';

  getReservations(roomId: string, start: Date, end: Date): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(
      `${this.apiUrl}/${roomId}/schedule`,
      {
        params: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    );
  }

  blockRoom(roomId: string, start: Date, end: Date, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${roomId}/block`, {
      start: start.toISOString(),
      end: end.toISOString(),
      reason
    });
  }
}

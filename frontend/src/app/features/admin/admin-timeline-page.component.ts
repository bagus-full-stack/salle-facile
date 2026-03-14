import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-timeline-page',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <div class="flex justify-between items-end mb-8">
        <div>
          <div class="text-sm text-[#1da1f2] font-semibold mb-1">Dashboard / Planning</div>
          <h1 class="text-3xl font-extrabold text-gray-900">Planning Journalier</h1>
        </div>

        <div class="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <button (click)="changeDate(-1)" class="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 font-bold">⬅️</button>
          <div class="font-bold text-gray-900 min-w-[150px] text-center">
            {{ currentDate() | date:'dd MMMM yyyy':'':'fr-FR' }}
          </div>
          <button (click)="changeDate(1)" class="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 font-bold">➡️</button>
          <button (click)="setToday()" class="ml-2 px-4 py-2 bg-[#1da1f2] text-white text-sm font-bold rounded-lg hover:bg-blue-500 transition">
            Aujourd'hui
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        @if (isLoading()) {
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1da1f2]"></div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <div class="min-w-[1000px]">

              <div class="flex border-b border-gray-200 bg-gray-50 pl-48">
                @for (hour of hours; track hour) {
                  <div class="flex-1 py-3 text-center border-l border-gray-200 text-xs font-bold text-gray-400">
                    {{ hour }}:00
                  </div>
                }
              </div>

              <div class="divide-y divide-gray-100">
                @for (room of roomsTimeline(); track room.id) {
                  <div class="flex relative group hover:bg-blue-50/20 transition h-20">

                    <div class="w-48 flex-shrink-0 p-4 border-r border-gray-200 bg-white z-10 flex flex-col justify-center">
                      <div class="font-bold text-gray-900 truncate">{{ room.name }}</div>
                      <div class="text-xs text-gray-400 mt-0.5">{{ room.capacity }} places</div>
                    </div>

                    <div class="flex-1 relative flex">
                      @for (hour of hours; track hour) {
                        <div class="flex-1 border-l border-gray-100 border-dashed h-full"></div>
                      }

                      @for (res of room.reservations; track res.id) {
                        <div
                          class="absolute top-2 bottom-2 rounded-lg shadow-sm border p-2 overflow-hidden cursor-pointer transition-all hover:shadow-md hover:z-20 flex flex-col justify-center"
                          [ngClass]="res.status === 'CONFIRMED' ? 'bg-[#0b648f] border-[#084a6b] text-white' : 'bg-yellow-100 border-yellow-300 text-yellow-800'"
                          [style.left]="getLeftPosition(res.startTime)"
                          [style.width]="getWidth(res.startTime, res.endTime)">
                          <div class="text-xs font-bold truncate">{{ res.user.firstName }} {{ res.user.lastName }}</div>
                          <div class="text-[10px] opacity-80 truncate">{{ res.startTime | date:'HH:mm' }} - {{ res.endTime | date:'HH:mm' }}</div>
                        </div>
                      }
                    </div>

                  </div>
                }

                @if (roomsTimeline().length === 0) {
                  <div class="p-8 text-center text-gray-500">Aucune salle configurée.</div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminTimelinePageComponent implements OnInit {
  private http = inject(HttpClient);

  public hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  private timelineStartHour = 8;
  private totalTimelineHours = 12; // De 8h à 20h

  public currentDate = signal<Date>(new Date());
  public roomsTimeline = signal<any[]>([]);
  public isLoading = signal<boolean>(true);

  ngOnInit() { this.loadTimeline(); }

  loadTimeline() {
    this.isLoading.set(true);
    const dateStr = this.currentDate().toISOString().split('T')[0];

    // Assure-toi que cette route existe bien dans ton backend NestJS (ReservationsController)
    this.http.get<any[]>(`http://localhost:3000/reservations/admin/timeline?date=${dateStr}`).subscribe({
      next: (data) => {
        this.roomsTimeline.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  changeDate(days: number) {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + days);
    this.currentDate.set(newDate);
    this.loadTimeline();
  }

  setToday() {
    this.currentDate.set(new Date());
    this.loadTimeline();
  }

  // Calcul du % pour la position horizontale
  getLeftPosition(startTime: string): string {
    const startHour = new Date(startTime).getHours() + new Date(startTime).getMinutes() / 60;
    const percentage = ((Math.max(this.timelineStartHour, startHour) - this.timelineStartHour) / this.totalTimelineHours) * 100;
    return `${Math.max(0, percentage)}%`;
  }

  // Calcul du % pour la largeur du bloc
  getWidth(startTime: string, endTime: string): string {
    const startHour = Math.max(this.timelineStartHour, new Date(startTime).getHours() + new Date(startTime).getMinutes() / 60);
    const endHour = Math.min(this.timelineStartHour + this.totalTimelineHours, new Date(endTime).getHours() + new Date(endTime).getMinutes() / 60);

    if (startHour >= endHour) return '0%';
    const percentage = ((endHour - startHour) / this.totalTimelineHours) * 100;
    return `${percentage}%`;
  }
}

import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminReservationsService } from '../../core/services/admin-reservations.service';

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
          <h1 class="text-3xl font-extrabold text-gray-900">Planning Journalier</h1>
          <p class="text-gray-500 mt-1">Vue d'ensemble de l'occupation des salles.</p>
        </div>

        <div class="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <button (click)="changeDate(-1)" class="p-2 hover:bg-gray-100 rounded-md transition text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          <div class="font-bold text-gray-900 min-w-[150px] text-center">
            {{ currentDate() | date:'EEEE dd MMMM yyyy':'':'fr-FR' | uppercase }}
          </div>

          <button (click)="changeDate(1)" class="p-2 hover:bg-gray-100 rounded-md transition text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>

          <button (click)="setToday()" class="ml-2 px-3 py-1.5 bg-[#1da1f2] text-white text-sm font-bold rounded-md hover:bg-blue-500 transition">
            Aujourd'hui
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">

        @if (isLoading()) {
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0b648f]"></div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <div class="min-w-[1000px]"> <div class="flex border-b border-gray-200 bg-gray-50 pl-48">
                @for (hour of hours; track hour) {
                  <div class="flex-1 py-3 text-center border-l border-gray-200 text-xs font-bold text-gray-400">
                    {{ hour }}:00
                  </div>
                }
              </div>

              <div class="divide-y divide-gray-100">
                @for (room of roomsTimeline(); track room.id) {
                  <div class="flex relative group hover:bg-blue-50/30 transition h-20">

                    <div class="w-48 flex-shrink-0 p-4 border-r border-gray-200 bg-white z-10 flex flex-col justify-center">
                      <div class="font-bold text-gray-900 truncate">{{ room.name }}</div>
                      <div class="text-xs text-gray-500 flex justify-between mt-1">
                        <span>👥 {{ room.capacity }} max</span>
                      </div>
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
                          [style.width]="getWidth(res.startTime, res.endTime)"
                          [title]="res.user.firstName + ' ' + res.user.lastName + ' - ' + res.reference">

                          <div class="text-xs font-bold truncate">{{ res.user.firstName }} {{ res.user.lastName }}</div>
                          <div class="text-[10px] opacity-80 truncate">
                            {{ res.startTime | date:'HH:mm' }} - {{ res.endTime | date:'HH:mm' }}
                          </div>
                        </div>
                      }
                    </div>

                  </div>
                }
              </div>

            </div>
          </div>
        }
      </div>

      <div class="flex gap-6 mt-6 ml-2">
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded bg-[#0b648f]"></span> <span class="text-sm text-gray-600 font-medium">Confirmé / Payé</span></div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded bg-yellow-300"></span> <span class="text-sm text-gray-600 font-medium">En attente de paiement</span></div>
      </div>

    </div>
  `
})
export class AdminTimelinePageComponent implements OnInit {
  private adminResService = inject(AdminReservationsService);

  // Notre frise va de 8h à 20h (12 heures d'amplitude)
  public hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  private timelineStartHour = 8;
  private timelineEndHour = 20;
  private totalTimelineHours = this.timelineEndHour - this.timelineStartHour;

  // État local
  public currentDate = signal<Date>(new Date());
  public roomsTimeline = signal<any[]>([]);
  public isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadTimeline();
  }

  loadTimeline() {
    this.isLoading.set(true);
    // On formate la date en YYYY-MM-DD pour l'API
    const dateStr = this.currentDate().toISOString().split('T')[0];

    this.adminResService.getTimeline(dateStr).subscribe({
      next: (data) => {
        this.roomsTimeline.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur timeline', err);
        this.isLoading.set(false);
      }
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

  // ⚡️ LA MAGIE DU GANTT : Calcule la position "left" en %
  getLeftPosition(startTime: string): string {
    const start = new Date(startTime);
    let startHour = start.getHours() + start.getMinutes() / 60;

    // Si la résa commence avant 8h, on la bloque à 8h (0%)
    if (startHour < this.timelineStartHour) startHour = this.timelineStartHour;

    const percentage = ((startHour - this.timelineStartHour) / this.totalTimelineHours) * 100;
    return `${Math.max(0, percentage)}%`;
  }

  // ⚡️ LA MAGIE DU GANTT : Calcule la "width" en %
  getWidth(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);

    let startHour = start.getHours() + start.getMinutes() / 60;
    let endHour = end.getHours() + end.getMinutes() / 60;

    // Bornage pour ne pas déborder du calendrier 8h-20h
    if (startHour < this.timelineStartHour) startHour = this.timelineStartHour;
    if (endHour > this.timelineEndHour) endHour = this.timelineEndHour;

    // Si la réservation est hors plage horaire, on ne l'affiche pas (width 0)
    if (startHour >= this.timelineEndHour || endHour <= this.timelineStartHour) return '0%';

    const duration = endHour - startHour;
    const percentage = (duration / this.totalTimelineHours) * 100;

    return `${percentage}%`;
  }
}

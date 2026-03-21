import { Component, Input, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailabilityService, Reservation } from '../../../core/services/availability.service';

interface TimeSlot {
  start: number; // Heure (ex: 9, 13)
  end: number;   // Heure (ex: 12, 17)
  label: string; // "09h-12h"
}

interface DayAvailability {
  date: Date;
  dayName: string;
  dayNumber: number;
  slots: { slot: TimeSlot; isAvailable: boolean }[];
}

@Component({
  selector: 'app-room-availability-calendar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-gray-900">Disponibilité de la salle</h2>
        <div class="flex gap-2">
          <button
            (click)="setViewMode('day')"
            [class.bg-blue-500]="viewMode() === 'day'"
            [class.text-white]="viewMode() === 'day'"
            class="px-3 py-1 rounded text-sm font-semibold border border-gray-200 transition">
            Jour
          </button>
          <button
            (click)="setViewMode('week')"
            [class.bg-blue-500]="viewMode() === 'week'"
            [class.text-white]="viewMode() === 'week'"
            class="px-3 py-1 rounded text-sm font-semibold border border-gray-200 transition">
            Semaine
          </button>
          <button
            (click)="setViewMode('month')"
            [class.bg-blue-500]="viewMode() === 'month'"
            [class.text-white]="viewMode() === 'month'"
            class="px-3 py-1 rounded text-sm font-semibold border border-gray-200 transition">
            Mois
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p class="text-gray-500 mt-2">Chargement de la disponibilité...</p>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          <p class="font-semibold">Erreur</p>
          <p class="text-sm">{{ error() }}</p>
        </div>
      } @else if (displayDays().length === 0) {
        <div class="bg-gray-50 text-gray-600 p-4 rounded-lg text-center">
          <p>Aucune disponibilité trouvée pour cette période.</p>
        </div>
      } @else {
        <!-- Affichage SEMAINE -->
        @if (viewMode() === 'week') {
          <div class="overflow-x-auto">
            <div class="grid gap-4" [style.grid-template-columns]="'repeat(' + displayDays().length + ', 1fr)'">
              @for (day of displayDays(); track day.date.toDateString()) {
                <div class="border rounded-lg p-4 border-gray-200">
                  <div class="text-center mb-4 pb-3 border-b border-gray-200">
                    <div class="font-semibold text-gray-900">{{ day.dayName }}</div>
                    <div class="text-sm text-gray-500">{{ day.dayNumber }}</div>
                  </div>

                  <div class="space-y-2">
                    @for (slotInfo of day.slots; track slotInfo.slot.label) {
                      <button
                        (click)="selectSlot(day.date, slotInfo.slot)"
                        [disabled]="!slotInfo.isAvailable"
                        [class.bg-red-100]="!slotInfo.isAvailable"
                        [class.text-red-600]="!slotInfo.isAvailable"
                        [class.cursor-not-allowed]="!slotInfo.isAvailable"
                        [class.bg-white]="slotInfo.isAvailable"
                        [class.border-blue-400]="isSlotSelected(day.date, slotInfo.slot)"
                        [class.ring-2]="isSlotSelected(day.date, slotInfo.slot)"
                        [class.ring-blue-500]="isSlotSelected(day.date, slotInfo.slot)"
                        class="w-full px-3 py-2 rounded text-sm font-semibold border border-gray-200 transition hover:border-blue-400"
                      >
                        {{ slotInfo.slot.label }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Affichage JOUR -->
        @if (viewMode() === 'day') {
          <div class="space-y-3">
            <div class="flex gap-4 mb-6">
              <input
                type="date"
                [value]="selectedDate() | date:'yyyy-MM-dd'"
                (change)="onDateChange($event)"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
            </div>

            @if (displayDays().length > 0) {
              <div class="grid grid-cols-2 gap-3">
                @for (slotInfo of displayDays()[0]?.slots; track slotInfo.slot.label) {
                  <button
                    (click)="selectSlot(selectedDate(), slotInfo.slot)"
                    [disabled]="!slotInfo.isAvailable"
                    [class.bg-red-100]="!slotInfo.isAvailable"
                    [class.text-red-600]="!slotInfo.isAvailable"
                    [class.bg-blue-50]="isSlotSelected(selectedDate(), slotInfo.slot)"
                    [class.border-blue-400]="isSlotSelected(selectedDate(), slotInfo.slot)"
                    class="px-4 py-3 rounded-lg text-sm font-semibold border border-gray-200 transition hover:border-blue-400 disabled:cursor-not-allowed"
                  >
                    {{ slotInfo.slot.label }}
                  </button>
                }
              </div>
            }
          </div>
        }
      }

      <!-- Résumé de la sélection -->
      @if (selectedSlots().length > 0) {
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="font-bold text-gray-900 mb-3">Créneaux sélectionnés:</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            @for (slot of selectedSlots(); track slot.dateTime.toISOString()) {
              <div class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                {{ slot.dateTime | date:'dd/MM à HH:mm' }} - {{ slot.endTime | date:'HH:mm' }}
                <button (click)="removeSlot(slot)" class="text-blue-500 hover:text-blue-700 ml-1">✕</button>
              </div>
            }
          </div>
          <button
            (click)="proceedToCheckout()"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
          >
            Continuer vers la réservation
          </button>
        </div>
      }
    </div>
  `
})
export class RoomAvailabilityCalendarComponent implements OnInit {
  @Input({ required: true }) roomId!: string;

  private availabilityService = inject(AvailabilityService);

  // États
  public viewMode = signal<'day' | 'week' | 'month'>('week');
  public isLoading = signal(false);
  public error = signal<string | null>(null);
  public selectedDate = signal(new Date());
  public displayDays = signal<DayAvailability[]>([]);
  public reservations = signal<Reservation[]>([]);

  // Créneaux horaires standards
  private readonly timeSlots: TimeSlot[] = [
    { start: 9, end: 12, label: '09h-12h' },
    { start: 13, end: 17, label: '13h-17h' }
  ];

  // Sélections utilisateur
  public selectedSlots = signal<{
    dateTime: Date;
    endTime: Date;
    label: string;
  }[]>([]);

  ngOnInit() {
    this.loadAvailability();
  }

  setViewMode(mode: 'day' | 'week' | 'month') {
    this.viewMode.set(mode);
    this.loadAvailability();
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(new Date(input.value));
    this.loadAvailability();
  }

  private loadAvailability() {
    this.isLoading.set(true);

    let start: Date, end: Date;

    if (this.viewMode() === 'day') {
      start = new Date(this.selectedDate());
      start.setHours(0, 0, 0, 0);
      end = new Date(this.selectedDate());
      end.setHours(23, 59, 59, 999);
    } else if (this.viewMode() === 'week') {
      const today = this.selectedDate();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi
      start = new Date(today.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      // Month
      start = new Date(this.selectedDate().getFullYear(), this.selectedDate().getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(this.selectedDate().getFullYear(), this.selectedDate().getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    this.availabilityService.getReservations(this.roomId, start, end).subscribe({
      next: (reservations) => {
        this.reservations.set(reservations || []);
        this.error.set(null);
        this.updateDisplay();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réservations:', err);
        // Ne pas bloquer le calendrier si les réservations ne chargent pas - afficher tous les créneaux comme disponibles
        this.reservations.set([]);
        this.error.set('Impossible de charger les réservations, mais vous pouvez continuer');
        this.updateDisplay();
        this.isLoading.set(false);
      }
    });
  }

  private updateDisplay() {
    const days: DayAvailability[] = [];

    if (this.viewMode() === 'week') {
      const today = this.selectedDate();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayNumber = date.getDate();

        days.push({
          date,
          dayName,
          dayNumber,
          slots: this.getSlotAvailability(date)
        });
      }
    } else if (this.viewMode() === 'day') {
      const date = this.selectedDate();
      days.push({
        date,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        dayNumber: date.getDate(),
        slots: this.getSlotAvailability(date)
      });
    }

    this.displayDays.set(days);
  }

  private getSlotAvailability(date: Date): { slot: TimeSlot; isAvailable: boolean }[] {
    return this.timeSlots.map(slot => {
      const slotStart = new Date(date);
      slotStart.setHours(slot.start, 0, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setHours(slot.end, 0, 0, 0);

      const isAvailable = !this.reservations().some(res => {
        const resStart = new Date(res.startTime);
        const resEnd = new Date(res.endTime);
        return resStart < slotEnd && resEnd > slotStart;
      });

      return { slot, isAvailable };
    });
  }

  selectSlot(date: Date, slot: TimeSlot) {
    const availability = this.getSlotAvailability(date);
    const slotInfo = availability.find(s => s.slot === slot);

    if (!slotInfo?.isAvailable) return;

    const startTime = new Date(date);
    startTime.setHours(slot.start, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(slot.end, 0, 0, 0);

    const alreadySelected = this.selectedSlots().some(
      s => s.dateTime.getTime() === startTime.getTime()
    );

    if (alreadySelected) {
      this.removeSlot(
        this.selectedSlots().find(s => s.dateTime.getTime() === startTime.getTime())!
      );
    } else {
      this.selectedSlots.update(slots => [
        ...slots,
        { dateTime: startTime, endTime, label: slot.label }
      ]);
    }
  }

  isSlotSelected(date: Date, slot: TimeSlot): boolean {
    const startTime = new Date(date);
    startTime.setHours(slot.start, 0, 0, 0);
    return this.selectedSlots().some(s => s.dateTime.getTime() === startTime.getTime());
  }

  removeSlot(slot: { dateTime: Date; endTime: Date; label: string }) {
    this.selectedSlots.update(slots =>
      slots.filter(s => s.dateTime.getTime() !== slot.dateTime.getTime())
    );
  }

  proceedToCheckout() {
    // Passer les créneaux sélectionnés au service de réservation
    console.log('Créneaux sélectionnés:', this.selectedSlots());
    // La navigation sera gérée depuis le composant parent
  }
}


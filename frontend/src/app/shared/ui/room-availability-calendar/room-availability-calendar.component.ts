import { Component, Input, ChangeDetectionStrategy, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-gray-900">Disponibilité de la salle</h2>
        <div class="flex gap-2">
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

      <!-- Sélecteur libre de plage horaire -->
      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 class="font-bold text-gray-900 mb-4">Sélectionner une plage horaire</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              [(ngModel)]="customStart"
              (change)="onCustomRangeChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Heure de début</label>
            <input
              type="time"
              [(ngModel)]="customStartTime"
              (change)="onCustomRangeChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              [(ngModel)]="customEnd"
              (change)="onCustomRangeChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Heure de fin</label>
            <input
              type="time"
              [(ngModel)]="customEndTime"
              (change)="onCustomRangeChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>

        @if (customRangeError()) {
          <div class="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-semibold mb-3">
            {{ customRangeError() }}
          </div>
        }

        @if (customRangeConflict()) {
          <div class="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-semibold mb-3">
            ⚠️ Cette plage chevauche un créneau déjà occupé ou bloqué.
          </div>
        }
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
      } @else {
        <!-- Affichage SEMAINE -->
        @if (viewMode() === 'week') {
          <div class="overflow-x-auto">
            <div class="space-y-4">
              <!-- Légende -->
              <div class="flex gap-4 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
                  <span>Disponible</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
                  <span>Occupé/Bloqué</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-blue-200 border border-blue-500 rounded"></div>
                  <span>Votre sélection</span>
                </div>
              </div>

              <!-- Grille des jours -->
              <div class="grid gap-2" [style.grid-template-columns]="'repeat(' + displayDays().length + ', 1fr)'">
                @for (day of displayDays(); track day.date.toDateString()) {
                  <div class="border rounded-lg overflow-hidden">
                    <div class="bg-gray-100 text-center py-2 border-b border-gray-200">
                      <div class="font-semibold text-gray-900 text-sm">{{ day.dayName }}</div>
                      <div class="text-xs text-gray-500">{{ day.dayNumber }}</div>
                    </div>

                    <div class="text-xs font-semibold">
                      @for (slotInfo of day.slots; track slotInfo.slot.label) {
                        <div
                          (click)="selectSlot(day.date, slotInfo.slot)"
                          [class.bg-red-100]="!slotInfo.isAvailable"
                          [class.bg-blue-200]="isInCustomRange(day.date, slotInfo.slot)"
                          [class.bg-green-100]="slotInfo.isAvailable && !isInCustomRange(day.date, slotInfo.slot)"
                          [class.cursor-not-allowed]="!slotInfo.isAvailable"
                          [class.cursor-pointer]="slotInfo.isAvailable"
                          [class.border-l-4]="isInCustomRange(day.date, slotInfo.slot)"
                          [class.border-blue-500]="isInCustomRange(day.date, slotInfo.slot)"
                          class="px-2 py-1 border-b border-gray-200 text-center text-gray-700"
                        >
                          {{ slotInfo.slot.label }}
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Affichage MOIS -->
        @if (viewMode() === 'month') {
          <div class="text-center text-gray-600 py-8">
            <p>Veuillez sélectionner votre plage horaire à l'aide des champs ci-dessus et afficher la semaine pour voir le calendrier détaillé.</p>
          </div>
        }
      }

      <!-- Résumé et validation -->
      @if (customStartDateTime() && customEndDateTime()) {
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <h3 class="font-bold text-gray-900 mb-2">Résumé de votre sélection</h3>
            <p class="text-sm text-gray-700">
              <strong>Du:</strong> {{ customStartDateTime() | date:'dd/MM/yyyy à HH:mm' }}
            </p>
            <p class="text-sm text-gray-700">
              <strong>Au:</strong> {{ customEndDateTime() | date:'dd/MM/yyyy à HH:mm' }}
            </p>
            <p class="text-sm text-gray-700 mt-2">
              <strong>Durée:</strong> {{ calculateDuration() }} heures
            </p>
          </div>

          @if (isAdmin) {
            <div class="space-y-3">
              <input
                #reasonInput
                type="text"
                placeholder="Raison du blocage (ex: Maintenance)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
              >
              <button
                (click)="blockCustomRange(reasonInput.value || 'Fermeture exceptionnelle')"
                [disabled]="customRangeConflict() || !customStartDateTime() || !customEndDateTime()"
                class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bloquer cette plage
              </button>
            </div>
          } @else {
            <button
              (click)="proceedToCheckout()"
              [disabled]="customRangeConflict() || !customStartDateTime() || !customEndDateTime()"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer vers la réservation
            </button>
          }
        </div>
      }
    </div>
  `
})
export class RoomAvailabilityCalendarComponent implements OnInit {
  @Input({ required: true }) roomId!: string;
  @Input() isAdmin = false;

  private availabilityService = inject(AvailabilityService);
  private router = inject(Router);

  // États
  public viewMode = signal<'week' | 'month'>('week');
  public isLoading = signal(false);
  public error = signal<string | null>(null);
  public selectedDate = signal(new Date());
  public displayDays = signal<DayAvailability[]>([]);
  public reservations = signal<Reservation[]>([]);

  // Sélecteur libre de plage
  public customStart = signal<string>('');
  public customStartTime = signal<string>('09:00');
  public customEnd = signal<string>('');
  public customEndTime = signal<string>('17:00');
  public customRangeError = signal<string>('');
  public customRangeConflict = signal(false);

  // Computed: Dates/Heures combinées
  public customStartDateTime = computed(() => {
    if (!this.customStart() || !this.customStartTime()) return null;
    const [startYear, startMonth, startDay] = this.customStart().split('-');
    const [startHour, startMin] = this.customStartTime().split(':');
    return new Date(
      parseInt(startYear),
      parseInt(startMonth) - 1,
      parseInt(startDay),
      parseInt(startHour),
      parseInt(startMin)
    );
  });

  public customEndDateTime = computed(() => {
    if (!this.customEnd() || !this.customEndTime()) return null;
    const [endYear, endMonth, endDay] = this.customEnd().split('-');
    const [endHour, endMin] = this.customEndTime().split(':');
    return new Date(
      parseInt(endYear),
      parseInt(endMonth) - 1,
      parseInt(endDay),
      parseInt(endHour),
      parseInt(endMin)
    );
  });

  // Créneaux horaires standards (24h/24)
  private readonly timeSlots: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
    start: i,
    end: i + 1,
    label: `${i}h-${i + 1}h`
  }));

  // Sélections anciennes (compatibilité)
  public selectedSlots = signal<{
    dateTime: Date;
    endTime: Date;
    label: string;
  }[]>([]);

  ngOnInit() {
    // Initialiser les dates par défaut
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.customStart.set(today.toISOString().split('T')[0]);
    this.customEnd.set(tomorrow.toISOString().split('T')[0]);

    this.loadAvailability();
  }

  setViewMode(mode: 'week' | 'month') {
    this.viewMode.set(mode);
    this.loadAvailability();
  }


  onCustomRangeChange() {
    const start = this.customStartDateTime();
    const end = this.customEndDateTime();

    this.customRangeError.set('');
    this.customRangeConflict.set(false);

    if (start && end) {
      if (start >= end) {
        this.customRangeError.set('La date/heure de fin doit être après celle de début.');
        return;
      }

      // Vérifier les conflits
      this.checkCustomRangeConflicts();
      this.loadAvailabilityForCustomRange();
    }
  }

  private checkCustomRangeConflicts() {
    const start = this.customStartDateTime();
    const end = this.customEndDateTime();

    if (!start || !end) return;

    const hasConflict = this.reservations().some(res => {
      const resStart = new Date(res.startTime);
      const resEnd = new Date(res.endTime);
      return resStart < end && resEnd > start;
    });

    this.customRangeConflict.set(hasConflict);
  }

  private loadAvailabilityForCustomRange() {
    const start = this.customStartDateTime();
    const end = this.customEndDateTime();

    if (!start || !end) return;

    // Charger les réservations pour la plage sélectionnée
    this.isLoading.set(true);
    const rangeStart = new Date(start);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(end);
    rangeEnd.setHours(23, 59, 59, 999);

    this.availabilityService.getReservations(this.roomId, rangeStart, rangeEnd).subscribe({
      next: (reservations) => {
        this.reservations.set(reservations || []);
        this.checkCustomRangeConflicts();
        this.updateDisplay();
        this.isLoading.set(false);
      },
      error: () => {
        this.reservations.set([]);
        this.updateDisplay();
        this.isLoading.set(false);
      }
    });
  }

  isInCustomRange(date: Date, slot: TimeSlot): boolean {
    const start = this.customStartDateTime();
    const end = this.customEndDateTime();

    if (!start || !end) return false;

    const slotStart = new Date(date);
    slotStart.setHours(slot.start, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(slot.end, 0, 0, 0);

    return slotStart >= start && slotEnd <= end;
  }

  calculateDuration(): string {
    const start = this.customStartDateTime();
    const end = this.customEndDateTime();

    if (!start || !end) return '0';

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(1);
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


  removeSlot(slot: { dateTime: Date; endTime: Date; label: string }) {
    this.selectedSlots.update(slots =>
      slots.filter(s => s.dateTime.getTime() !== slot.dateTime.getTime())
    );
  }

  proceedToCheckout() {
    const start = this.customStartDateTime();
    const end = this.customEndDateTime();

    if (!start || !end || this.customRangeConflict()) return;

    this.router.navigate(['/reservation/checkout'], {
      queryParams: {
        roomId: this.roomId,
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  }

  blockCustomRange(reason: string) {
    const start = this.customStartDateTime();
    const end = this.customEndDateTime();

    if (!start || !end || this.customRangeConflict()) return;

    this.isLoading.set(true);
    this.availabilityService.blockRoom(this.roomId, start, end, reason).subscribe({
      next: () => {
        this.customStart.set('');
        this.customEnd.set('');
        this.customRangeError.set('');
        this.customRangeConflict.set(false);
        this.loadAvailability();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du blocage:', err);
        this.error.set('Erreur lors du blocage de la plage.');
        this.isLoading.set(false);
      }
    });
  }

  // ...existing code...
  private loadAvailability() {
    this.isLoading.set(true);

    let start: Date, end: Date;

    if (this.viewMode() === 'week') {
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
}

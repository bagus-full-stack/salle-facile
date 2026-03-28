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
        @if (!hideViewToggle) {
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
        }
      </div>

      @if (viewMode() === 'week') {
        <div class="flex justify-start mb-6">
          <div class="inline-flex items-center bg-white border border-gray-100 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] p-1.5">
            <button
              (click)="goToPreviousWeek()"
              class="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <div class="font-bold text-gray-900 px-6 min-w-[160px] text-center text-sm">
              {{ weekLabel() }}
            </div>

            <button
              (click)="goToNextWeek()"
              class="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <button
              (click)="goToToday()"
              class="bg-[#1da1f2] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#1a91da] transition-all ml-4 shadow-sm">
              Aujourd'hui
            </button>
          </div>
        </div>
      }

      <!-- Sélecteur libre de plage horaire -->
      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 class="font-bold text-gray-900 mb-4">Sélectionner une plage horaire</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              [(ngModel)]="customStart"
              (change)="onStartChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Heure de début</label>
            <input
              type="time"
              [(ngModel)]="customStartTime"
              (change)="onStartChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              [(ngModel)]="customEnd"
              [min]="endDateMin()"
              (change)="onEndChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Heure de fin</label>
            <input
              type="time"
              [(ngModel)]="customEndTime"
              [min]="endTimeMin()"
              (change)="onEndChange()"
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

              <!-- Grille continue type Google Calendar -->
              <div class="grid" [style.grid-template-columns]="'80px repeat(' + displayDays().length + ', 1fr)'">
                <!-- Axe Y -->
                <div class="relative border-r border-gray-200">
                  @for (hour of hours; track hour) {
                    <div class="text-[11px] text-gray-500 h-12 leading-[48px] px-2 border-b border-gray-100">
                      {{ hour }}:00
                    </div>
                  }
                </div>

                <!-- Colonnes des jours -->
                @for (day of displayDays(); track day.date.toDateString()) {
                  <div class="relative border-l border-gray-100" style="height: 1152px;"> <!-- 24h * 48px -->
                    <div class="sticky top-0 bg-white z-10 text-center py-2 border-b border-gray-200">
                      <div class="font-semibold text-gray-900 text-sm">{{ day.dayName }}</div>
                      <div class="text-xs text-gray-500">{{ day.dayNumber }}</div>
                    </div>

                    <!-- lignes horizontales légères -->
                    @for (hour of hours; track hour) {
                      <div class="absolute left-0 right-0 border-b border-gray-100"
                           [style.top.px]="hour * 48"
                           style="height: 48px;"></div>
                    }

                    <!-- Blocs réservations / blocages -->
                    @for (event of getDayEvents(day.date); track event.id) {
                      <div class="absolute left-1 right-1 rounded-md shadow-sm text-[12px] px-2 py-1 overflow-hidden"
                           [ngClass]="{
                             'bg-red-200 border border-red-400 text-red-900': event.type === 'busy',
                             'bg-blue-200 border border-blue-500 text-blue-900': event.type === 'selection'
                           }"
                           [style.top.px]="event.top"
                           [style.height.px]="event.height">
                        <div class="font-semibold truncate">{{ event.label }}</div>
                        <div class="text-xs opacity-80">{{ event.timeLabel }}</div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

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
              Continuer vers le paiement
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
  @Input() hideViewToggle = false;

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
  public endDateMin = computed(() => this.customStart() || '');
  public endTimeMin = computed(() =>
    this.customEnd() === this.customStart() ? this.customStartTime() || '' : ''
  );
  public weekLabel = computed(() => {
    const { start, end } = this.getWeekRange(this.selectedDate());
    const format = (date: Date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${format(start)} - ${format(end)}`;
  });

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

  public hours = Array.from({ length: 24 }, (_, i) => i);
  private readonly minutePx = 48 / 60; // 48px per hour container, so 0.8px per minute

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

  goToPreviousWeek() {
    const current = this.selectedDate();
    const target = new Date(current);
    target.setDate(target.getDate() - 7);
    this.selectedDate.set(target);
    this.loadAvailability();
  }

  goToNextWeek() {
    const current = this.selectedDate();
    const target = new Date(current);
    target.setDate(target.getDate() + 7);
    this.selectedDate.set(target);
    this.loadAvailability();
  }

  goToToday() {
    this.selectedDate.set(new Date());
    this.loadAvailability();
  }

  onStartChange() {
    this.updateEndIfInvalid();
    this.onCustomRangeChange();
  }

  onEndChange() {
    this.onCustomRangeChange();
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

  private updateEndIfInvalid() {
    const start = this.customStartDateTime();
    const end = this.customEndDateTime();

    if (!start) {
      return;
    }

    if (!end || end <= start) {
      const newEnd = new Date(start.getTime() + 60 * 60 * 1000);
      this.customEnd.set(this.formatDate(newEnd));
      this.customEndTime.set(this.formatTime(newEnd));
    }
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

    this.router.navigate(['/checkout'], {
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

    console.log('[blockCustomRange] ===== SENDING BLOCK REQUEST =====');
    console.log('[blockCustomRange] roomId:', this.roomId);
    console.log('[blockCustomRange] start (Date):', start);
    console.log('[blockCustomRange] start ISO:', start.toISOString());
    console.log('[blockCustomRange] end (Date):', end);
    console.log('[blockCustomRange] end ISO:', end.toISOString());
    console.log('[blockCustomRange] reason:', reason);
    const payload = {
      start: start.toISOString(),
      end: end.toISOString(),
      reason
    };
    console.log('[blockCustomRange] payload:', JSON.stringify(payload));

    this.isLoading.set(true);
    this.availabilityService.blockRoom(this.roomId, start, end, reason).subscribe({
      next: () => {
        console.log('[blockCustomRange] ===== BLOCK REQUEST SUCCESS =====');
        console.log('[blockCustomRange] ✅ Créneau bloqué avec succès');
        // Affiche un message de succès à l'utilisateur
        this.customRangeError.set('✅ Créneau bloqué avec succès');
        this.customStart.set('');
        this.customEnd.set('');
        this.customRangeConflict.set(false);
        this.loadAvailability();
        this.isLoading.set(false);
        // Efface le message après 3 secondes
        setTimeout(() => {
          this.customRangeError.set('');
        }, 3000);
      },
      error: (err) => {
        console.error('[blockCustomRange] ===== BLOCK REQUEST FAILED =====');
        console.error('[blockCustomRange] error:', err);
        console.error('[blockCustomRange] error status:', err.status);
        console.error('[blockCustomRange] error statusText:', err.statusText);
        console.error('[blockCustomRange] error message:', err.message);
        if (err.error) {
          console.error('[blockCustomRange] error.error:', JSON.stringify(err.error));
        }
        console.error('Erreur lors du blocage:', err);
        // Affiche le message d'erreur du serveur ou un message par défaut
        const errorMessage = err.error?.message || err.message || 'Erreur lors du blocage de la plage.';
        this.customRangeError.set(`❌ ${errorMessage}`);
        this.isLoading.set(false);
      }
    });
  }

  private loadAvailability() {
    this.isLoading.set(true);

    let start: Date, end: Date;

    if (this.viewMode() === 'week') {
      const range = this.getWeekRange(this.selectedDate());
      start = range.start;
      end = range.end;
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
      const { start } = this.getWeekRange(this.selectedDate());

      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
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

  private getWeekRange(reference: Date) {
    const ref = new Date(reference);
    ref.setHours(0, 0, 0, 0);

    const dayOfWeek = ref.getDay();
    const diff = ref.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi

    const start = new Date(ref);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
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

  public getDayEvents(date: Date) {
    const events: Array<{
      id: string;
      label: string;
      timeLabel: string;
      top: number;
      height: number;
      type: 'busy' | 'selection';
    }> = [];

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Réservations et blocages
    for (const res of this.reservations()) {
      const resStart = new Date(res.startTime);
      const resEnd = new Date(res.endTime);
      if (resStart > dayEnd || resEnd < dayStart) continue;

      const start = resStart < dayStart ? dayStart : resStart;
      const end = resEnd > dayEnd ? dayEnd : resEnd;

      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const heightMinutes = Math.max(15, endMinutes - startMinutes); // mini visibilité

      const label = res.status === 'BLOCKED' ? 'Bloqué' : 'Réservation';
      const timeLabel = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

      events.push({
        id: res.id,
        label,
        timeLabel,
        top: startMinutes * this.minutePx,
        height: heightMinutes * this.minutePx,
        type: 'busy'
      });
    }

    // Plage sélectionnée manuelle (custom range)
    const startSel = this.customStartDateTime();
    const endSel = this.customEndDateTime();
    if (startSel && endSel && startSel < dayEnd && endSel > dayStart) {
      const start = startSel < dayStart ? dayStart : startSel;
      const end = endSel > dayEnd ? dayEnd : endSel;

      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const heightMinutes = Math.max(15, endMinutes - startMinutes);

      const timeLabel = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

      events.push({
        id: `selection-${dayStart.getTime()}`,
        label: 'Votre sélection',
        timeLabel,
        top: startMinutes * this.minutePx,
        height: heightMinutes * this.minutePx,
        type: 'selection'
      });
    }

    return events;
  }

  private formatDate(date: Date) {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

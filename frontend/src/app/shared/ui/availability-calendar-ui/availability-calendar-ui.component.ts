import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DaySlot {
  date: string;
  dayName: string;
  dayNumber: string;
  slots: { time: string; isReserved: boolean }[];
  isClosed?: boolean;
}

@Component({
  selector: 'app-availability-calendar-ui',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900">Disponibilité de la salle</h2>
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button class="px-4 py-1.5 text-sm rounded-md text-gray-600">Jour</button>
          <button class="px-4 py-1.5 text-sm rounded-md bg-[#1da1f2] text-white shadow">Semaine</button>
          <button class="px-4 py-1.5 text-sm rounded-md text-gray-600">Mois</button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-4 text-center">
        @for (day of weekData; track day.date) {
          <div class="flex flex-col gap-3">
            <div class="mb-2">
              <div class="font-bold text-gray-900">{{ day.dayName }}</div>
              <div class="text-sm text-gray-500">{{ day.dayNumber }}</div>
            </div>

            @if (day.isClosed) {
              <div class="bg-gray-50 text-gray-400 py-8 rounded-lg text-sm flex items-center justify-center h-full">Fermé</div>
            } @else {
              @for (slot of day.slots; track slot.time) {
                <button
                  [disabled]="slot.isReserved"
                  (click)="onSlotSelected.emit({date: day.date, time: slot.time})"
                  class="py-2 px-1 text-sm rounded-lg border transition-colors"
                  [ngClass]="slot.isReserved
                    ? 'bg-red-50/50 border-red-100 text-red-400 line-through cursor-not-allowed'
                    : 'border-gray-200 text-gray-700 hover:border-[#1da1f2] hover:text-[#1da1f2]'">
                  {{ slot.time }}
                </button>
              }
            }
          </div>
        }
      </div>
    </div>
  `
})
export class AvailabilityCalendarUiComponent {
  @Input({ required: true }) weekData!: DaySlot[];
  @Output() onSlotSelected = new EventEmitter<{date: string, time: string}>();
}

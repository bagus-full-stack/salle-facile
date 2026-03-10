import { Component, Input, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Room } from '../../../core/services/room.service';
import { AvailabilityCalendarUiComponent, DaySlot } from '../availability-calendar-ui/availability-calendar-ui.component';

@Component({
  selector: 'app-room-details-ui',
  standalone: true,
  imports: [CommonModule, AvailabilityCalendarUiComponent],
  // Optimisation extreme des performances
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen">

      <div class="mb-8">
        <div class="text-sm text-gray-500 mb-3 tracking-wide">Accueil > Salles > <span class="font-medium text-gray-900">{{ room.name }}</span></div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ room.name }}</h1>
        <p class="text-gray-600 text-lg">Idéale pour réunions créatives et ateliers collaboratifs</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 flex flex-col gap-4">
          <div class="w-full h-[450px] rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
            <img [src]="room.images[0]?.url" alt="Vue principale" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="grid grid-cols-4 gap-4 h-28">
            @for (img of room.images.slice(1, 5); track img.id) {
              <div class="rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm relative group">
                <img [src]="img.url" class="w-full h-full object-cover">
                @if ($last) {
                  <div class="absolute inset-0 bg-slate-800/60 flex items-center justify-center text-white font-medium">
                    +5 photos
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <div class="lg:col-span-1 flex flex-col gap-6">

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4 text-gray-900">Description et Attributs</h2>
            <p class="text-gray-600 text-sm mb-6 leading-relaxed">{{ room.description }}</p>

            <div class="grid grid-cols-2 gap-4 mb-6 border-y border-gray-100 py-4">
              <div class="flex items-center gap-3">
                <div class="text-gray-400 text-xl">👥</div>
                <div>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Capacité</p>
                  <p class="font-medium text-gray-900">{{ room.capacity }} personnes</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-gray-400 text-xl">🏢</div>
                <div>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Catégorie</p>
                  <p class="font-medium text-gray-900">{{ room.category }}</p>
                </div>
              </div>
            </div>

            <h3 class="font-bold text-gray-900 mb-3 text-sm">Équipements inclus:</h3>
            <ul class="space-y-3 text-sm text-gray-600">
              @for (eq of room.equipments; track eq.id) {
                <li class="flex items-center gap-3">
                  <span class="text-gray-400 border border-gray-200 rounded p-1">✓</span>
                  {{ eq.name }}
                </li>
              }
            </ul>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-6 text-gray-900">Tarification</h2>

            <div class="space-y-4 mb-8">
              <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <span class="text-gray-600">Par heure:</span>
                <span class="font-bold text-blue-500 text-base">{{ room.hourlyPrice }}€</span>
              </div>
              <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <span class="text-gray-600">Demi-journée (4h):</span>
                <span class="font-bold text-blue-500 text-base">{{ room.halfDayPrice }}€</span>
              </div>
              <div class="flex justify-between items-center text-sm pb-1">
                <span class="text-gray-600">Journée complète (8h):</span>
                <span class="font-bold text-blue-500 text-base">{{ room.fullDayPrice }}€</span>
              </div>
            </div>

            <button (click)="reserveRoom()" class="w-full bg-[#1da1f2] hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm">
              Réserver cette salle
            </button>
          </div>

        </div>
      </div>

      <!-- Availability Calendar Section -->
      <div class="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Disponibilite de la salle</h2>
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button 
              (click)="viewMode.set('day')" 
              [class.bg-white]="viewMode() === 'day'"
              [class.shadow-sm]="viewMode() === 'day'"
              class="px-4 py-1.5 text-sm rounded-md text-gray-600 transition">
              Jour
            </button>
            <button 
              (click)="viewMode.set('week')" 
              [class.bg-[#1da1f2]]="viewMode() === 'week'"
              [class.text-white]="viewMode() === 'week'"
              [class.shadow]="viewMode() === 'week'"
              class="px-4 py-1.5 text-sm rounded-md text-gray-600 transition">
              Semaine
            </button>
            <button 
              (click)="viewMode.set('month')" 
              [class.bg-white]="viewMode() === 'month'"
              [class.shadow-sm]="viewMode() === 'month'"
              class="px-4 py-1.5 text-sm rounded-md text-gray-600 transition">
              Mois
            </button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-4 text-center">
          @for (day of weekData(); track day.date) {
            <div class="flex flex-col gap-3">
              <div class="mb-2">
                <div class="font-bold text-gray-900">{{ day.dayName }}</div>
                <div class="text-sm text-gray-500">{{ day.dayNumber }}</div>
              </div>

              @if (day.isClosed) {
                <div class="bg-gray-50 text-gray-400 py-8 rounded-lg text-sm flex items-center justify-center h-full">Ferme</div>
              } @else {
                @for (slot of day.slots; track slot.time) {
                  <button
                    [disabled]="slot.isReserved"
                    (click)="selectSlot(day.date, slot.time)"
                    class="py-2 px-1 text-sm rounded-lg border transition-colors"
                    [ngClass]="slot.isReserved
                      ? 'bg-red-50/50 border-red-100 text-red-400 line-through cursor-not-allowed'
                      : selectedSlot()?.date === day.date && selectedSlot()?.time === slot.time
                        ? 'bg-[#1da1f2] border-[#1da1f2] text-white'
                        : 'border-gray-200 text-gray-700 hover:border-[#1da1f2] hover:text-[#1da1f2]'">
                    {{ slot.time }}
                  </button>
                }
              }
            </div>
          }
        </div>

        @if (selectedSlot()) {
          <div class="mt-6 p-4 bg-blue-50 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-sm text-gray-600">Creneau selectionne:</span>
              <span class="ml-2 font-bold text-gray-900">{{ selectedSlot()?.date }} a {{ selectedSlot()?.time }}</span>
            </div>
            <button 
              (click)="reserveWithSlot()" 
              class="bg-[#1da1f2] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0b648f] transition">
              Continuer la reservation
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class RoomDetailsUiComponent {
  private router = inject(Router);

  // Le Smart Component passera l'objet Room ici
  @Input({ required: true }) room!: Room;

  // State for calendar
  public viewMode = signal<'day' | 'week' | 'month'>('week');
  public selectedSlot = signal<{ date: string; time: string } | null>(null);

  // Generate mock week data - in production this would come from an API
  public weekData = computed<DaySlot[]>(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();
    
    return days.map((dayName, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + index + 1);
      
      const isSunday = index === 6;
      
      return {
        date: date.toISOString().split('T')[0],
        dayName,
        dayNumber: date.getDate().toString(),
        isClosed: isSunday,
        slots: isSunday ? [] : [
          { time: '09h-12h', isReserved: Math.random() > 0.7 },
          { time: '13h-17h', isReserved: Math.random() > 0.7 }
        ]
      };
    });
  });

  selectSlot(date: string, time: string) {
    this.selectedSlot.set({ date, time });
  }

  reserveRoom() {
    this.router.navigate(['/checkout'], { state: { room: this.room } });
  }

  reserveWithSlot() {
    const slot = this.selectedSlot();
    this.router.navigate(['/checkout'], { 
      state: { 
        room: this.room,
        selectedDate: slot?.date,
        selectedTime: slot?.time
      } 
    });
  }
}

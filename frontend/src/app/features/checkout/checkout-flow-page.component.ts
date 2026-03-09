import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Room } from '../../core/services/room.service';

@Component({
  selector: 'app-checkout-flow-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Confirmation et Paiement</h1>

      @if (room()) {
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <svg class="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <div>
            <span class="font-bold text-blue-800">Réservation confirmée !</span>
            <span class="text-blue-700 ml-2">Un e-mail de confirmation avec tous les détails a été envoyé à votre adresse.</span>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 space-y-8">

          @if (room()) {
            <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 class="text-lg font-bold mb-4">Résumé de votre réservation</h2>
              <div class="flex gap-6">
                @if (room()!.images[0]?.url) {
                  <img [src]="room()!.images[0].url" [alt]="room()!.name" class="w-40 h-28 object-cover rounded-xl shrink-0">
                }
                <div class="space-y-2">
                  <h3 class="font-bold text-gray-900 text-lg">{{ room()!.name }}</h3>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{{ dateForm.value.startDate | date:'EEEE d MMMM yyyy':'':'fr-FR' }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>{{ dateForm.value.startTime }} - {{ dateForm.value.endTime }} ({{ durationHours() }}h)</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm font-bold text-blue-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    <span>{{ subtotal() | number:'1.2-2' }} €</span>
                  </div>
                </div>
              </div>
            </section>
          }

          <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4">Date et Horaires</h2>
            <form [formGroup]="dateForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                <input type="date" formControlName="startDate" class="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Heure de début</label>
                <input type="time" formControlName="startTime" class="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Heure de fin</label>
                <input type="time" formControlName="endTime" class="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
              </div>
            </form>
          </section>

          <section>
            <h2 class="text-lg font-bold mb-4">Options de Forfait</h2>
            <div class="grid grid-cols-3 gap-4">
              <button (click)="packageType.set('HOURLY')"
                [class.border-[#1da1f2]]="packageType() === 'HOURLY'"
                [class.ring-1]="packageType() === 'HOURLY'"
                class="p-4 border rounded-xl text-center bg-white hover:border-[#1da1f2] transition">
                <div class="text-[#1da1f2] mb-2 text-xl">🕒</div>
                <div class="font-bold text-gray-900">Tarif Horaire</div>
                @if (room()) {
                  <div class="text-sm text-[#1da1f2]">{{ room()!.hourlyPrice }}€ / heure</div>
                }
              </button>
              <button (click)="packageType.set('HALF_DAY')"
                [class.border-[#1da1f2]]="packageType() === 'HALF_DAY'"
                class="p-4 border rounded-xl text-center bg-white hover:border-gray-400 transition">
                <div class="text-gray-600 mb-2 text-xl">◑</div>
                <div class="font-bold text-gray-900">Demi-Journée</div>
                @if (room()) {
                  <div class="text-sm text-gray-500">4 heures - {{ room()!.halfDayPrice }}€</div>
                }
              </button>
              <button (click)="packageType.set('FULL_DAY')"
                [class.border-[#1da1f2]]="packageType() === 'FULL_DAY'"
                class="p-4 border rounded-xl text-center bg-white hover:border-gray-400 transition">
                <div class="text-gray-600 mb-2 text-xl">📅</div>
                <div class="font-bold text-gray-900">Journée Complète</div>
                @if (room()) {
                  <div class="text-sm text-gray-500">8h+ - {{ room()!.fullDayPrice }}€</div>
                }
              </button>
            </div>
          </section>

          <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4">Informations de Facturation</h2>
            <form [formGroup]="billingForm" class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Prénom</label>
                  <input type="text" formControlName="firstName" class="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nom</label>
                  <input type="text" formControlName="lastName" class="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Adresse</label>
                <input type="text" formControlName="address" class="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
              </div>
            </form>
          </section>

          <section>
            <h2 class="text-lg font-bold mb-4">Méthode de Paiement</h2>
            <div class="space-y-4">
              <label class="flex gap-3 p-4 border border-[#1da1f2] bg-blue-50/10 rounded-xl cursor-pointer">
                <input type="radio" name="payment" [checked]="paymentMethod() === 'CREDIT_CARD'" (change)="paymentMethod.set('CREDIT_CARD')" class="mt-1">
                <div class="flex-1">
                  <div class="font-bold text-gray-900">Payer maintenant (Carte de Crédit/Débit)</div>
                  <div class="text-sm text-gray-500">Paiement sécurisé via notre plateforme.</div>

                  @if (paymentMethod() === 'CREDIT_CARD') {
                    <div class="mt-4 grid gap-4 p-4 border rounded-lg bg-white">
                      <input type="text" placeholder="Nom complet sur la carte" class="w-full border rounded-md p-2 text-sm">
                      <input type="text" placeholder="Numéro de carte" class="w-full border rounded-md p-2 text-sm">
                      <div class="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/AA" class="w-full border rounded-md p-2 text-sm">
                        <input type="text" placeholder="CVC" class="w-full border rounded-md p-2 text-sm">
                      </div>
                    </div>
                  }
                </div>
              </label>

              <label class="flex gap-3 p-4 border rounded-xl cursor-pointer">
                <input type="radio" name="payment" [checked]="paymentMethod() === 'ONSITE'" (change)="paymentMethod.set('ONSITE')" class="mt-1">
                <div>
                  <div class="font-bold text-gray-900">Payer plus tard (sur place)</div>
                  <div class="text-sm text-gray-500">Le paiement sera effectué directement à l'établissement lors de votre arrivée.</div>
                  <p class="text-xs text-gray-400 mt-1">Un e-mail de confirmation sera envoyé avec les détails de paiement.</p>
                </div>
              </label>
            </div>
          </section>

          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {{ errorMessage() }}
            </div>
          }

          <button (click)="submitReservation()" [disabled]="isSubmitting()" class="w-full bg-[#1da1f2] hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg shadow-sm transition disabled:opacity-50">
            {{ isSubmitting() ? 'Traitement...' : 'Confirmer la réservation' }}
          </button>

        </div>

        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h2 class="text-lg font-bold mb-6">Récapitulatif</h2>

            @if (room()) {
              <div class="mb-4 pb-4 border-b">
                <p class="font-bold text-gray-900">{{ room()!.name }}</p>
                <p class="text-sm text-gray-500">{{ room()!.capacity }} places max</p>
              </div>
            }

            <div class="border-b pb-4 mb-4 space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Sous-total</span>
                <span class="font-medium">{{ subtotal() | number:'1.2-2' }} €</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Taxes (20%)</span>
                <span class="font-medium">{{ tax() | number:'1.2-2' }} €</span>
              </div>
            </div>

            <div class="flex justify-between items-end mb-6">
              <span class="font-bold text-gray-900">Total à payer</span>
              <span class="text-2xl font-bold text-gray-900">{{ total() | number:'1.2-2' }} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutFlowPageComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Room data passed from room details page via router state
  public room = signal<Room | null>(null);

  // State signals
  public packageType = signal<'HOURLY' | 'HALF_DAY' | 'FULL_DAY'>('HOURLY');
  public paymentMethod = signal<'CREDIT_CARD' | 'ONSITE'>('CREDIT_CARD');
  public isSubmitting = signal(false);
  public errorMessage = signal<string | null>(null);

  // Date/time form
  public dateForm = this.fb.group({
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    startTime: ['09:00', Validators.required],
    endTime: ['17:00', Validators.required],
  });

  // Billing info form
  public billingForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: [''],
  });

  constructor() {
    // Read room from router state passed by room-details-ui
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { room: Room } | undefined;
    const historyState = state ?? (typeof window !== 'undefined' ? (window.history.state as { room?: Room }) : undefined);
    if (historyState?.room) {
      this.room.set(historyState.room);
    }
  }

  public durationHours = computed(() => {
    const start = this.dateForm.value.startTime ?? '09:00';
    const end = this.dateForm.value.endTime ?? '17:00';
    const startParts = start.split(':').map(Number);
    const endParts = end.split(':').map(Number);
    if (startParts.length < 2 || endParts.length < 2 || startParts.some(isNaN) || endParts.some(isNaN)) {
      return 0;
    }
    return Math.max(0, (endParts[0] * 60 + endParts[1] - startParts[0] * 60 - startParts[1]) / 60);
  });

  public subtotal = computed(() => {
    const r = this.room();
    if (!r) return 0;
    switch (this.packageType()) {
      case 'HOURLY': return Number(r.hourlyPrice) * this.durationHours();
      case 'HALF_DAY': return Number(r.halfDayPrice);
      case 'FULL_DAY': return Number(r.fullDayPrice);
    }
  });

  public tax = computed(() => this.subtotal() * 0.20);
  public total = computed(() => this.subtotal() + this.tax());

  submitReservation() {
    const r = this.room();
    if (!r) {
      this.errorMessage.set('Aucune salle sélectionnée. Veuillez retourner à la liste des salles.');
      return;
    }

    const { startDate, startTime, endTime } = this.dateForm.value;
    if (!startDate || !startTime || !endTime) {
      this.errorMessage.set('Veuillez renseigner la date et les horaires.');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${startDate}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      this.errorMessage.set("L'heure de fin doit être après l'heure de début.");
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = {
      roomId: r.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      paymentMethod: this.paymentMethod()
    };

    this.http.post<any>('http://localhost:3000/reservations', payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/checkout/success'], {
          state: {
            reservation: res,
            paymentMethod: this.paymentMethod(),
            room: r,
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors de la réservation. Veuillez réessayer.');
      }
    });
  }
}

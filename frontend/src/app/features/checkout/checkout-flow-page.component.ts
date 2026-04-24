import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../core/services/room.service';

export function calculateTotalPrice(durationInHours: number, prices: { PRICE_DAY: number | string, PRICE_HALF_DAY: number | string, PRICE_HOUR: number | string }) {
  let remainingHours = durationInHours;

  const priceDay = Number(prices.PRICE_DAY) || 0;
  const priceHalfDay = Number(prices.PRICE_HALF_DAY) || 0;
  const priceHour = Number(prices.PRICE_HOUR) || 0;

  let days = 0;
  let halfDays = 0;
  let hours = 0;

  let fullDaysCost = 0;
  let halfDaysCost = 0;
  let hoursCost = 0;

  // 1. Journée (8h) : Tant que duration >= 8, ajouter PRICE_DAY et soustraire 8h.
  while (remainingHours >= 8) {
    fullDaysCost += priceDay;
    remainingHours -= 8;
    days++;
  }

  // 2. Demi-journée (4h) : Si duration >= 4, ajouter PRICE_HALF_DAY et soustraire 4h.
  if (remainingHours >= 4) {
    halfDaysCost += priceHalfDay;
    remainingHours -= 4;
    halfDays++;
  }

  // 3. Heures restantes : Multiplier le reste par PRICE_HOUR.
  if (remainingHours > 0) {
    hoursCost += remainingHours * priceHour;
    hours = remainingHours;
  }

  // Optimisations (plafonnement) pour le client
  if (hoursCost > priceHalfDay) {
    hoursCost = 0;
    hours = 0;
    halfDaysCost += priceHalfDay;
    halfDays++;
  }

  if ((halfDaysCost + hoursCost) > priceDay) {
    halfDaysCost = 0;
    hoursCost = 0;
    halfDays = 0;
    hours = 0;
    fullDaysCost += priceDay;
    days++;
  }

  const total = fullDaysCost + halfDaysCost + hoursCost;

  // Formatage du détail de calcul
  const details = [];
  if (days > 0) details.push(`${days} jour${days > 1 ? 's' : ''}`);
  if (halfDays > 0) details.push(`${halfDays} demi-journée${halfDays > 1 ? 's' : ''}`);
  if (hours > 0) details.push(`${hours} heure${hours > 1 ? 's' : ''}`);

  return {
    totalAmount: total,
    detail: details.join(', ') || '0 heure',
    parts: { days, halfDays, hours }
  };
}

@Component({
  selector: 'app-checkout-flow-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Flux de Réservation</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 space-y-8">

          <section>
            <h2 class="text-lg font-bold mb-4">Aperçu du Tarif</h2>
            @if (roomService.isLoading()) {
              <div class="p-4 border rounded-xl text-gray-500 bg-white shadow-sm text-center">
                Chargement des informations de la salle...
              </div>
            } @else if (roomService.currentRoom()) {
              <div class="bg-white p-6 border rounded-xl shadow-sm text-gray-800">
                <div class="mb-4">
                  <h3 class="font-bold text-xl text-gray-900">{{ roomService.currentRoom()!.name }}</h3>
                  <p class="text-sm text-gray-500">{{ roomService.currentRoom()!.category }} • Capacité: {{ roomService.currentRoom()!.capacity }} pers.</p>
                </div>

                <div class="flex flex-col gap-2 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <div class="flex justify-between items-center text-sm">
                    <span class="font-semibold">Tarif Horaire :</span>
                    <span>{{ roomService.currentRoom()!.hourlyPrice }}€</span>
                  </div>
                  <div class="flex justify-between items-center text-sm transition text-gray-600">
                    <span class="font-semibold">Tarif Demi-Journée (4h) :</span>
                    <span>{{ roomService.currentRoom()!.halfDayPrice }}€</span>
                  </div>
                  <div class="flex justify-between items-center text-sm transition text-gray-600">
                    <span class="font-semibold">Tarif Journée Complète (8h) :</span>
                    <span>{{ roomService.currentRoom()!.fullDayPrice }}€</span>
                  </div>
                </div>
              </div>
            } @else {
               <div class="p-4 border border-red-200 bg-red-50 text-red-700 rounded-xl shadow-sm">
                Erreur: Impossible de charger les informations de la salle.
              </div>
            }
          </section>

          <section>
            <h2 class="text-lg font-bold mb-4">Méthode de Paiement</h2>
            <div class="space-y-4">
              <label class="flex gap-3 p-4 border border-[#1da1f2] bg-blue-50/10 rounded-xl cursor-pointer">
                <input type="radio" name="payment" [checked]="paymentMethod() === 'CREDIT_CARD'" (change)="paymentMethod.set('CREDIT_CARD')" class="mt-1">
                <div>
                  <div class="font-bold text-gray-900">Paiement en ligne (Carte de Crédit/Débit)</div>
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
                  <div class="font-bold text-gray-900">Paiement sur place</div>
                  <div class="text-sm text-gray-500">Le paiement sera effectué directement à l'établissement lors de votre arrivée.</div>
                </div>
              </label>
            </div>
          </section>

          <button (click)="submitReservation()" [disabled]="isSubmitting()" class="w-full bg-[#82b1ff] hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg shadow-sm transition">
            {{ isSubmitting() ? 'Traitement...' : 'Confirmer la réservation' }}
          </button>

        </div>

        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h2 class="text-lg font-bold mb-6">Récapitulatif de la Réservation</h2>

            @if (startTime() && endTime()) {
              <div class="mb-6 text-sm text-gray-700 space-y-1">
                <div class="font-semibold text-gray-900">Créneau sélectionné</div>
                <div>Début : {{ startTime() | date:'dd/MM/yyyy HH:mm' }}</div>
                <div>Fin : {{ endTime() | date:'dd/MM/yyyy HH:mm' }}</div>
                <div class="mt-2 text-indigo-600 font-medium">Durée totale : {{ durationInHours() }} heure(s)</div>
              </div>
            }

            <div class="border-b pb-4 mb-4 space-y-3 text-sm">
              <div class="flex flex-col gap-1">
                <span class="text-gray-500 font-semibold mb-1">Détail du calcul :</span>
                <div class="text-gray-700 bg-gray-50 p-2 rounded border text-xs">
                  {{ priceCalculation().detail }}
                </div>
              </div>

              <div class="flex justify-between mt-4">
                <span class="text-gray-500">Sous-total (HT)</span>
                <span class="font-medium">{{ priceCalculation().totalAmount.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>0.00 €</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Taxes (20%)</span>
                <span class="font-medium">{{ (priceCalculation().totalAmount * 0.2).toFixed(2) }} €</span>
              </div>
            </div>

            <div class="flex justify-between items-end mb-2">
              <span class="font-bold text-gray-900">Total à payer</span>
              <span class="text-2xl font-bold text-gray-900">{{ (priceCalculation().totalAmount * 1.2).toFixed(2) }} €</span>
            </div>
            <div class="text-right text-xs text-gray-500 mb-6">Paiement pour : {{ durationInHours() }} h.</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutFlowPageComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public roomService = inject(RoomService);

  // ⚡️ État local via Signals
  public paymentMethod = signal<'CREDIT_CARD' | 'ONSITE'>('CREDIT_CARD');
  public isSubmitting = signal(false);
  public roomId = signal<string | null>(null);
  public startTime = signal<string | null>(null);
  public endTime = signal<string | null>(null);

  public durationInHours = computed(() => {
    const startStr = this.startTime();
    const endStr = this.endTime();
    if (!startStr || !endStr) return 0;
    const durationMs = new Date(endStr).getTime() - new Date(startStr).getTime();
    return Math.max(0, durationMs / (1000 * 60 * 60));
  });

  public priceCalculation = computed(() => {
    const room = this.roomService.currentRoom();
    const duration = this.durationInHours();
    if (!room || duration <= 0) {
      return { totalAmount: 0, detail: '0 heure' };
    }

    return calculateTotalPrice(duration, {
      PRICE_DAY: room.fullDayPrice,
      PRICE_HALF_DAY: room.halfDayPrice,
      PRICE_HOUR: room.hourlyPrice
    });
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['roomId'];
      this.roomId.set(id ?? null);
      this.startTime.set(params['start'] ?? null);
      this.endTime.set(params['end'] ?? null);

      if (id) {
        this.roomService.loadRoomDetails(id);
      }
    });
  }

  submitReservation() {
    if (!this.roomId()) {
      alert("Erreur: Aucune salle sélectionnée.");
      return;
    }
    this.isSubmitting.set(true);

    const payload = {
      roomId: this.roomId(), // Passé via router state
      startTime: this.startTime() ?? new Date().toISOString(),
      endTime: this.endTime() ?? new Date(Date.now() + 4 * 3600000).toISOString(),
      paymentMethod: this.paymentMethod()
    };

    this.http.post('http://localhost:3000/reservations', payload).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        // Redirection vers la page de succès avec l'ID de la réservation créé
        this.router.navigate(['/checkout/success'], { queryParams: { reservationId: res.id } });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert("Erreur lors de la réservation : " + err.error.message);
      }
    });
  }
}

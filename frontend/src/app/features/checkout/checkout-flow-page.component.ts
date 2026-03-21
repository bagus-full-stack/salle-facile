import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

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
            <h2 class="text-lg font-bold mb-4">Options de Forfait</h2>
            <div class="grid grid-cols-3 gap-4">
              <button (click)="packageType.set('HOURLY')"
                [class.border-[#1da1f2]]="packageType() === 'HOURLY'"
                [class.ring-1]="packageType() === 'HOURLY'"
                class="p-4 border rounded-xl text-center bg-white hover:border-[#1da1f2] transition">
                <div class="text-[#1da1f2] mb-2 text-xl">🕒</div>
                <div class="font-bold text-gray-900">Tarif Horaire</div>
                <div class="text-sm text-[#1da1f2]">35€ / heure</div>
              </button>
              <button (click)="packageType.set('HALF_DAY')"
                [class.border-[#1da1f2]]="packageType() === 'HALF_DAY'"
                class="p-4 border rounded-xl text-center bg-white hover:border-gray-400 transition">
                <div class="text-gray-600 mb-2 text-xl">◑</div>
                <div class="font-bold text-gray-900">Demi-Journée</div>
                <div class="text-sm text-gray-500">4 heures - 120€</div>
              </button>
              <button (click)="packageType.set('FULL_DAY')"
                [class.border-[#1da1f2]]="packageType() === 'FULL_DAY'"
                class="p-4 border rounded-xl text-center bg-white hover:border-gray-400 transition">
                <div class="text-gray-600 mb-2 text-xl">📅</div>
                <div class="font-bold text-gray-900">Journée Complète</div>
                <div class="text-sm text-gray-500">8h+ - 200€</div>
              </button>
            </div>
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

            <div class="border-b pb-4 mb-4 space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Sous-total (4h x 35€)</span>
                <span class="font-medium">140,00 €</span>
              </div>
              <div class="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-20,00 €</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Taxes (20%)</span>
                <span class="font-medium">24,00 €</span>
              </div>
            </div>

            <div class="flex justify-between items-end mb-2">
              <span class="font-bold text-gray-900">Total à payer</span>
              <span class="text-2xl font-bold text-gray-900">144.00 €</span>
            </div>
            <div class="text-right text-xs text-gray-500 mb-6">Paiement en ligne: 144.00 €</div>
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

  // ⚡️ État local via Signals
  public packageType = signal<'HOURLY' | 'HALF_DAY' | 'FULL_DAY'>('HOURLY');
  public paymentMethod = signal<'CREDIT_CARD' | 'ONSITE'>('CREDIT_CARD');
  public isSubmitting = signal(false);
  public roomId = signal<string | null>(null);

  // Computed properties (Exemple de calcul dynamique basé sur les signals)
  public subtotal = computed(() => {
    switch (this.packageType()) {
      case 'HOURLY': return 140; // Hardcodé pour la démo, viendrait des dates sélectionnées
      case 'HALF_DAY': return 120;
      case 'FULL_DAY': return 200;
    }
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.roomId.set(params['roomId']);
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
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 4 * 3600000).toISOString(),
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

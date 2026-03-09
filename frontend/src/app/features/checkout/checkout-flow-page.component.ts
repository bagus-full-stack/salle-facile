import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-flow-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white font-sans flex flex-col">

      <header class="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2 font-bold text-[#2b5e6e] text-lg">
          <span class="text-xl">🏢</span> SalleFacile
        </div>
        <nav class="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="/" class="hover:text-[#2b5e6e] transition">Accueil</a>
          <a href="/mon-espace" class="hover:text-[#2b5e6e] transition">Mon Espace</a>
        </nav>
        <div class="w-9 h-9 rounded-full overflow-hidden border-2 border-green-400">
          <img src="https://i.pravatar.cc/100?img=5" alt="User" class="w-full h-full object-cover">
        </div>
      </header>

      <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-10">

        <h1 class="text-3xl font-bold text-gray-900 mb-6">Confirmation et Paiement</h1>

        <div class="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
          <span class="text-blue-500 text-lg mt-0.5">✉️</span>
          <div>
            <p class="font-bold text-blue-600">Réservation confirmée !</p>
            <p class="text-sm text-gray-600">Un e-mail de confirmation avec tous les détails a été envoyé à votre adresse.</p>
          </div>
        </div>

        <section class="mb-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Résumé de votre réservation</h2>
          <div class="border-b border-gray-200 pb-6 flex gap-6 items-start">
            <img src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=400&q=80" alt="Salle" class="w-48 h-32 object-cover rounded-lg flex-shrink-0">
            <div class="space-y-2">
              <h3 class="text-lg font-bold text-gray-900">Salle de Conférence 'Lumière'</h3>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <span class="text-[#1da1f2]">📅</span> Mardi 23 Juillet 2024
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <span class="text-[#1da1f2]">🕐</span> 09:00 - 17:00 (8 heures)
              </div>
              <div class="flex items-center gap-2 text-sm font-bold text-[#1da1f2]">
                <span>💳</span> 350,00 €
              </div>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Informations de Facturation</h2>
          <div class="border-b border-gray-200 pb-6 space-y-1 text-gray-700">
            <p class="font-semibold">Jean Dupont</p>
            <p>123 Rue de la République</p>
            <p>75001 Paris</p>
            <p>France</p>
          </div>
        </section>

        <div class="space-y-3">
          <button (click)="payNow()" [disabled]="isSubmitting()" class="w-full bg-[#1da1f2] hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg transition disabled:opacity-50">
            {{ isSubmitting() ? 'Traitement...' : 'Payer maintenant' }}
          </button>
          <button (click)="payLater()" [disabled]="isSubmitting()" class="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-xl text-lg transition disabled:opacity-50">
            Payer plus tard
          </button>
          <p class="text-center text-sm text-gray-400">Un e-mail de confirmation sera envoyé avec les détails de paiement.</p>
        </div>

      </main>

      <footer class="border-t border-gray-100 px-6 py-4 flex justify-between items-center text-xs text-gray-400">
        <span>© 2024 SalleFacile. Tous droits réservés.</span>
        <div class="flex gap-4">
          <a href="#" class="hover:text-gray-600">Conditions d'utilisation</a>
          <a href="#" class="hover:text-gray-600">Politique de confidentialité</a>
        </div>
      </footer>

    </div>
  `
})
export class CheckoutFlowPageComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  public isSubmitting = signal(false);

  payNow() {
    this.isSubmitting.set(true);

    const payload = {
      roomId: 'ID_DE_LA_SALLE',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 8 * 3600000).toISOString(),
      paymentMethod: 'CREDIT_CARD'
    };

    this.http.post('http://localhost:3000/reservations', payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/checkout/success']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert("Erreur lors de la réservation : " + err.error.message);
      }
    });
  }

  payLater() {
    this.isSubmitting.set(true);

    const payload = {
      roomId: 'ID_DE_LA_SALLE',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 8 * 3600000).toISOString(),
      paymentMethod: 'ONSITE'
    };

    this.http.post('http://localhost:3000/reservations', payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/checkout/success']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert("Erreur lors de la réservation : " + err.error.message);
      }
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 class="text-2xl font-bold mb-6">Nouveau mot de passe</h2>
        <input #newPass type="password" placeholder="••••••••" class="w-full border p-3 rounded-lg mb-4">
        <button (click)="submit(newPass.value)" class="w-full bg-[#2b5e6e] text-white py-3 rounded-lg font-bold">
          Mettre à jour
        </button>
      </div>
    </div>
  `
})
export class ResetPasswordPageComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  submit(password: string) {
    const token = this.route.snapshot.queryParams['token'];
    this.http.post('http://localhost:3000/auth/reset-password', { token, password }).subscribe({
      next: () => {
        alert("Mot de passe mis à jour !");
        this.router.navigate(['/login']);
      }
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  template: `<div class="min-h-screen flex items-center justify-center bg-gray-50">
               <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1da1f2]"></div>
             </div>`
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    // On récupère le token dans l'URL
    const token = this.route.snapshot.queryParams['token'];

    if (token) {
      // On délègue la gestion du token au service d'authentification
      this.authService.loadUserFromToken(token);

      // On redirige vers l'espace personnel
      this.router.navigate(['/mon-espace']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}

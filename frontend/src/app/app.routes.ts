import { Routes } from '@angular/router';

// Imports de nos composants (Smart Components)
import { AuthPageComponent } from './features/public/auth-page.component';
import { RoomDetailsPageComponent } from './features/public/room-details-page.component';
import { CheckoutFlowPageComponent } from './features/checkout/checkout-flow-page.component';
import { CheckoutSuccessPageComponent } from './features/checkout/checkout-success-page.component';
import { UserDashboardPageComponent } from './features/user/user-dashboard-page.component';
import { AdminFinancePageComponent } from './features/admin/admin-finance-page.component';
import { AdminRoomEditPageComponent } from './features/admin/admin-room-edit-page.component';
import { AdminAnalyticsPageComponent } from './features/admin/admin-analytics-page.component';
import {HomePageComponent} from './features/public/home-page.component';

// Imports de nos Guards fonctionnels
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import {AdminReservationsPageComponent} from './features/admin/admin-reservations-page.component';
import {AdminUsersPageComponent} from './features/admin/admin-users-page.component';
import {OAuthCallbackComponent} from './features/public/oauth-callback.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },

  // ==========================================
  // 🟢 ROUTES PUBLIQUES (Libre accès)
  // ==========================================
  { path: 'login', component: AuthPageComponent },
  { path: 'salles/:id', component: RoomDetailsPageComponent },
  { path: 'oauth/callback', component: OAuthCallbackComponent },

  // ==========================================
  // 🟡 ROUTES UTILISATEURS (Nécessite d'être connecté)
  // ==========================================
  {
    path: 'checkout',
    component: CheckoutFlowPageComponent,
    canActivate: [authGuard] // <-- Bloqué si non connecté
  },
  {
    path: 'checkout/success',
    component: CheckoutSuccessPageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'mon-espace',
    component: UserDashboardPageComponent,
    canActivate: [authGuard]
  },

  // ==========================================
  // 🔴 ROUTES ADMIN (Nécessite le rôle Admin)
  // ==========================================
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard], // <-- Double protection !
    children: [
      // Toutes les routes enfants hériteront de cette protection automatiquement
      { path: 'finances', component: AdminFinancePageComponent },
      { path: 'analyses', component: AdminAnalyticsPageComponent },
      { path: 'reservations', component: AdminReservationsPageComponent },
      { path: 'utilisateurs', component: AdminUsersPageComponent },
      { path: 'salles/edition', component: AdminRoomEditPageComponent },
      // Redirection par défaut du panel admin
      { path: '', redirectTo: 'finances', pathMatch: 'full' }
    ]
  },

  // ==========================================
  // 🌌 FALLBACK (Redirection si la route n'existe pas)
  // ==========================================
  { path: '**', redirectTo: 'login' }
];

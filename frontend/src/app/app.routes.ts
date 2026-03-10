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
import { AdminLayoutComponent } from './features/admin/admin-layout.component';
import { AdminRoomsPageComponent } from './features/admin/admin-rooms-page.component';
import {HomePageComponent} from './features/public/home-page.component';
import { ForgotPasswordPageComponent } from './features/public/forgot-password-page.component';
import { ResetPasswordPageComponent } from './features/public/reset-password-page.component';

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
  { path: 'forgot-password', component: ForgotPasswordPageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },

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
  // 🔴 ROUTES ADMIN (Necessite le role Admin)
  // ==========================================
  {
    path: 'admin',
    component: AdminLayoutComponent, // <-- Layout avec sidebar
    canActivate: [authGuard, adminGuard], // <-- Double protection !
    children: [
      // Toutes les routes enfants heritent de cette protection automatiquement
      { path: 'reservations', component: AdminReservationsPageComponent },
      { path: 'salles', component: AdminRoomsPageComponent },
      { path: 'salles/edition', component: AdminRoomEditPageComponent },
      { path: 'salles/edition/:id', component: AdminRoomEditPageComponent },
      { path: 'finances', component: AdminFinancePageComponent },
      { path: 'analyses', component: AdminAnalyticsPageComponent },
      { path: 'utilisateurs', component: AdminUsersPageComponent },
      // Redirection par defaut du panel admin
      { path: '', redirectTo: 'reservations', pathMatch: 'full' }
    ]
  },

  // ==========================================
  // 🌌 FALLBACK (Redirection si la route n'existe pas)
  // ==========================================
  { path: '**', redirectTo: 'login' }
];

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
import {AdminRoomsPageComponent} from './features/admin/admin-rooms-page.component';
import {AdminTimelinePageComponent} from './features/admin/admin-timeline-page.component';
import {MainLayoutComponent} from './shared/ui/layout/main-layout/main-layout.component';
import {ResetPasswordPageComponent} from './features/public/reset-password-page.component';
import {RoomsListPageComponent} from './features/public/rooms-list-page.component';
import {AdminDashboardPageComponent} from './features/admin/admin-dashboard-page.component';
import {AdminSettingsPageComponent} from './features/admin/admin-settings-page.component';
import {AdminLayoutComponent} from './features/admin/admin-layout.component';
import {ReservationPageComponent} from './features/public/reservation-page.component';

export const routes: Routes = [
  // 1. Layout par défaut (avec Header + Footer)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomePageComponent },

      // 🟢 ROUTES PUBLIQUES
      // { path: 'salles', component: RoomsListPageComponent },
      { path: 'salles/:id', component: RoomDetailsPageComponent },
      { path: 'reservation', component: ReservationPageComponent },
      { path: 'oauth/callback', component: OAuthCallbackComponent },

      // 🟡 ROUTES UTILISATEURS
      {
        path: 'checkout',
        component: CheckoutFlowPageComponent,
        canActivate: [authGuard]
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


    ]
  },

  // 2. Layout ADMIN (NOUVEAU)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardPageComponent, title: 'Tableau de bord' },

      { path: 'salles', component: AdminRoomsPageComponent, title: 'Gestion des Salles' },
      { path: 'salles/edition/:id', component: AdminRoomEditPageComponent },
      { path: 'salles/nouveau', component: AdminRoomEditPageComponent },

      { path: 'utilisateurs', component: AdminUsersPageComponent, title: 'Utilisateurs & Rôles' },

      { path: 'finances', component: AdminFinancePageComponent, title: 'Finances' },
      { path: 'analyses', component: AdminAnalyticsPageComponent, title: 'Analyses' },

      { path: 'reservations', component: AdminReservationsPageComponent },
      { path: 'planning', component: AdminTimelinePageComponent },

      { path: 'parametres', component: AdminSettingsPageComponent, title: 'Paramètres' },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 3. Routes sans Layout (Plein écran, Login, etc.)
  { path: 'login', component: AuthPageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },

  // 3. Fallback
  { path: '**', redirectTo: '' }
];

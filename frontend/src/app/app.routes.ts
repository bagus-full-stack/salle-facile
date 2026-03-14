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

export const routes: Routes = [
  // 1. Layout par défaut (avec Header + Footer)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomePageComponent },

      // 🟢 ROUTES PUBLIQUES
      { path: 'salles/:id', component: RoomDetailsPageComponent },
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

      // 🔴 ROUTES ADMIN
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
          { path: 'finances', component: AdminFinancePageComponent },
          { path: 'analyses', component: AdminAnalyticsPageComponent },
          { path: 'reservations', component: AdminReservationsPageComponent },
          { path: 'utilisateurs', component: AdminUsersPageComponent },
          { path: 'salles', component: AdminRoomsPageComponent },
          { path: 'planning', component: AdminTimelinePageComponent },
          { path: '', redirectTo: 'finances', pathMatch: 'full' }
        ]
      }
    ]
  },

  // 2. Routes sans Layout (Plein écran, Login, etc.)
  { path: 'login', component: AuthPageComponent },

  // 3. Fallback
  { path: '**', redirectTo: 'login' }
];

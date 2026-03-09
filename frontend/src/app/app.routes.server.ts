import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'salles/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Server
  },
  {
    path: 'checkout/success',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

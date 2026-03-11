import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./presentation/auth/auth.routing')
 },
 {
  path: 'survey',
  loadChildren: () => import('./presentation/survey/survey.routing')
},
{
  path: 'tracking',
  loadChildren: () => import('./presentation/tracking/tracking.routing')
},
{
  path: 'tracking-user',
  loadChildren: () => import('./presentation/tracking-user/tracking-user.routing')
},
{
  path: '',
  redirectTo: 'auth/sign-in',
  pathMatch: 'full'
}
];

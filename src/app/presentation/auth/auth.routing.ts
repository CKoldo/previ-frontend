import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      { path: '', component: SignInComponent },
      { path: 'sign-in', component: SignInComponent },
    ],
  },
] as Routes;

import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


export default [
  {
    path: '',
    loadComponent: () =>
      import('./survey-layout/survey-layout.component').then(
        (m) => m.SurveyLayoutComponent
      ),
    children: [
      {
        path: '',
        component: HomeComponent
      }
    ],
  },
] as Routes;

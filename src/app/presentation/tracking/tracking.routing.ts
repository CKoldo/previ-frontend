import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TrackingSurveyEditComponent } from './components/tracking-survey-edit/tracking-survey-edit.component';


export default [
  {
    path: '',
    loadComponent: () =>
      import('./tracking-layout/tracking-layout.component').then(
        (m) => m.TrackingLayoutComponent
      ),
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'survey-edit',
        component: TrackingSurveyEditComponent
      }
    ],
  },
] as Routes;

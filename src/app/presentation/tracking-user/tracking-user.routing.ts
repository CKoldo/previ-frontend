import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TableCheckerComponent } from './components/table-checker/table-checker.component';
import {TableEditFinComponent} from './components/table-edit-fin/table-edit-fin.component';
import { SurveyEditComponent } from './components/survey-edit/survey-edit.component';


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
        path: 'app-table-checker',
        component: TableCheckerComponent
      },
      {
        path: 'app-table-edit-fin',
        component: TableEditFinComponent
      },
      {
        path: 'survey-edit',
        component: SurveyEditComponent
      }
    ],
  },
] as Routes;

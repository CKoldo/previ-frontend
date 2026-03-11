import { LoadingService } from './../../../shared/services/loading.service';
import { Component, inject, ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../components/footer/footer.component';
import { TableCheckerComponent } from '../components/table-checker/table-checker.component';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    //FooterComponent,
    //TableCheckerComponent,
    ButtonModule,
    CardModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private router: Router) {}
  //navigate to table checker component
  navigateToTableChecker() {
    this.router.navigate(['/tracking-user/app-table-checker']);
  }
  //navigate to edit component
  navigateToEdit() {
    this.router.navigate(['/tracking-user/app-table-edit-fin']);
  }

  navigateToSurveyEdit() {
    this.router.navigate(['/tracking-user/survey-edit']);
  }
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-survey-layout',
  imports: [RouterOutlet,HeaderComponent,FooterComponent],
  templateUrl: './survey-layout.component.html',
  styleUrls: ['./survey-layout.component.css']
})
export class SurveyLayoutComponent {

}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-tracking-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './tracking-layout.component.html',
  styleUrl: './tracking-layout.component.css'
})
export class TrackingLayoutComponent {

}

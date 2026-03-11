import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  nameIE:string='';
  constructor(private router: Router) {
      const dataUser:any = localStorage.getItem("dataUser") ? JSON.parse(localStorage.getItem("dataUser") as string) : null;
    if(dataUser){
       this.nameIE=dataUser?.NOMBRE_IE;
    }
  }

  logout(){
    localStorage.clear();
    this.router.navigate(['/auth/sign-in']);
  }
}

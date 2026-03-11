import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-ie-identification',
  imports: [FormsModule,ReactiveFormsModule,CommonModule,DropdownModule,InputTextModule],
  templateUrl: './ie-identification.component.html',
  styleUrl: './ie-identification.component.css'
})
export class IeIdentificationComponent {
  formGroup!: FormGroup;


  sectors=[];
  dres=[];
  ugels=[];

  constructor(
    private _fb: FormBuilder,
    private _Router: Router,
  ) {
    this.createFormGroup();
    this.fillData();
  }

  private createFormGroup() {
    this.formGroup = this._fb.group({
      dre: [{ value: '', disabled: true }],
      ugel: [{ value: '', disabled: true }],
      institutionName: [{ value: '', disabled: true }],
      institutionCode: [{ value: '', disabled: true }],
    });
  }

  private fillData(){
    const dataUser:any = localStorage.getItem("dataUser") ? JSON.parse(localStorage.getItem("dataUser") as string) : null;
    if(dataUser){
       this.formGroup.patchValue({
        dre:dataUser.DRE,
        ugel:dataUser.UGEL,
        institutionName:dataUser.NOMBRE_IE,
        institutionCode:dataUser.CODIGO_LOCAL
       })
    }
  }

}

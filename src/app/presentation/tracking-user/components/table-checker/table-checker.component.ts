import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ITrackingUserRepository } from 'app/domain/tracking-user/tracking-user.repository';
import { TrackingUserRepository } from 'app/infrastructure/repositories/tracking-user.repository';
import { GetListUserTrackingHandler } from 'app/application/tracking-user/get-list-user-tracking/get-list-user-tracking.handler';
import { GetListUserTrackingQuery } from 'app/application/tracking-user/get-list-user-tracking/get-list-user-tracking.query';
import { SaveUserTrackingCommand } from 'app/application/tracking-user/save-user-tracking/save-user-tracking.command';
import { SaveUserTrackingHandler } from 'app/application/tracking-user/save-user-tracking/save-user-tracking.handler';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-checker',
  imports: [CommonModule, CheckboxModule, FormsModule, TableModule, DialogModule, InputTextModule, ButtonModule, CardModule],
  providers: [
    { provide: ITrackingUserRepository, useClass: TrackingUserRepository },
    { provide: GetListUserTrackingQuery, useClass: GetListUserTrackingHandler },
    { provide: SaveUserTrackingCommand, useClass: SaveUserTrackingHandler }
  ],
  templateUrl: './table-checker.component.html',
  styleUrl: './table-checker.component.css',
})
export class TableCheckerComponent {
  arrayTabla: any[] = [];
  isLoading: boolean = false;
  userDialog: boolean = false;
  selectUser: any = null;
  selectUserOri: any = null;
  selectUserLocalCode: string = '';
    searchValue: string | undefined;
  constructor(
    private _getListUserTrackingQuery: GetListUserTrackingQuery,
    private _saveUserTrackingCommand: SaveUserTrackingCommand,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDataUserTracking();
  }

  goBack(){
    this.router.navigate(['/tracking-user']);
  }

  async getDataUserTracking() {
    this.isLoading = true;
    let data=await this._getListUserTrackingQuery.execute();
    if(data?.result && data?.result.length > 0) {
      this.arrayTabla = data.result;
    }
    this.isLoading = false;
  }

  hideDialog(loadData=false){
    this.selectUser = null;
    this.selectUserOri = null;
    this.selectUserLocalCode = '';
    this.userDialog = false;
    if(loadData) {
      this.getDataUserTracking();
    }
  }

  showDialog(user:any) {
  // Siempre usar deepCopy para evitar referencia al objeto original
  this.selectUser = this.deepCopy(user);
  this.selectUserOri = this.deepCopy(user);
  this.selectUserLocalCode = this.selectUser.CODIGO_LOCAL;
  this.userDialog = true;
  }

  saveUser(){
   Swal.fire({
      text: '¿Esta seguro de actualizar este registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar'
    }).then(async (result: any) => {
      if (result.value) {
        Swal.fire({
          title: 'Guardando datos...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        let dataSave={
          ID_ACCESO: this.selectUser.ID_ACCESO,
          CODIGO_LOCAL: this.selectUserLocalCode,
          NUMERO_DOCUMENTO_IE: this.selectUser.NUMERO_DOCUMENTO_IE,
          NUMERO_DOCUMENTO_DRE: this.selectUser.NUMERO_DOCUMENTO_DRE,
          NUMERO_DOCUMENTO_UGEL: this.selectUser.NUMERO_DOCUMENTO_UGEL
        }

        const isSaved = await this._saveUserTrackingCommand.execute(dataSave);

        if (isSaved) {
          Swal.close();
          return this.hideDialog(true);
        }
      }
    });

  }

  cleanVal(eve:any){
      return eve.target?.value??''
  }

  detectSelect(dataEntry:any){
    return this.selectUserOri
    && this.selectUserOri.CODIGO_LOCAL === dataEntry.CODIGO_LOCAL
    && this.selectUserOri.NUMERO_DOCUMENTO_IE === dataEntry.NUMERO_DOCUMENTO_IE
    && this.selectUserOri.NUMERO_DOCUMENTO_DRE === dataEntry.NUMERO_DOCUMENTO_DRE
    && this.selectUserOri.NUMERO_DOCUMENTO_UGEL === dataEntry.NUMERO_DOCUMENTO_UGEL;
  }

  deepCopy(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => this.deepCopy(item));
  const copy: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = this.deepCopy(obj[key]);
    }
  }
  return copy;
}

  logout(){
    localStorage.clear();
    this.router.navigate(['/auth/sign-in']);
  }
}

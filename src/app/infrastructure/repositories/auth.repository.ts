import { Injectable } from '@angular/core';
import { IAuthRepository } from '../../domain/auth/auth.repository';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { SignIn, SignInDREUGEL } from '../../domain/auth/sign-in.model';
@Injectable()
export class AuthRepository implements IAuthRepository {
  private readonly _apiUrlBase: string;

  constructor(private _HttpClient: HttpClient) {
    this._apiUrlBase = environment.API_URL_BASE;
  }

  getToken() {
    return lastValueFrom(
      this._HttpClient.post(`${this._apiUrlBase}api/seguridad/token`,null)
    );
  }

  signIn(params:SignIn) {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
    const options = {
      headers: headers
    };
    if (params.CODIGO_LOCAL) {
      return lastValueFrom(
        this._HttpClient.post(`${this._apiUrlBase}api/sistema/user_register`,params,options)
      );
    }
    return lastValueFrom(
      this._HttpClient.post(`${this._apiUrlBase}api/sistema/user_register`, {
        "NUMERO_DOCUMENTO":params.NUMERO_DOCUMENTO,
      })
    );
  }

  getUserTracking(params:SignInDREUGEL) {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
    const options = {
      headers: headers
    };
    return lastValueFrom(
      this._HttpClient.post(`${this._apiUrlBase}api/sistema/user_tracking`,params,options)
    );
  }


  getMineduData(params: any) {
    return params.NUMERO_DOCUMENTO === environment.MINEDU_DNI;
  }
}

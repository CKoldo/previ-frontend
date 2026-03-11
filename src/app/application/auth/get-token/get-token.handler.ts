import { Injectable } from "@angular/core";
import { IAuthRepository } from "app/domain/auth/auth.repository";
import { Token } from "app/domain/auth/token.model";
import { GetTokenQuery } from "./get-token.query";

@Injectable({
  providedIn: 'root'
})
export class GetTokenHandler implements GetTokenQuery{
  constructor(private _authRepository:IAuthRepository){}

  public execute():Promise<Token>{
    return this._authRepository.getToken();
  }

}

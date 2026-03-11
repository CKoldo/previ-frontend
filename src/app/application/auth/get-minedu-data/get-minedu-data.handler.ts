import { Injectable } from "@angular/core";
import { IAuthRepository } from "app/domain/auth/auth.repository";
import { GetMineduDataQuery } from "./get-minedu-data.query";

@Injectable({
  providedIn: 'root'
})
export class GetMineduDataHandler implements GetMineduDataQuery{
  constructor(private _authRepository:IAuthRepository){}

  public execute(params:any):Promise<any>{
    return this._authRepository.getMineduData(params);
  }

}

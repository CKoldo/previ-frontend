import { Injectable } from "@angular/core";
import { IAuthRepository } from "app/domain/auth/auth.repository";
import { SignInDREUGEL, UserData, UserTrack } from "app/domain/auth/sign-in.model";
import { GetUserTrackingQuery } from "./get-user-tracking.query";
@Injectable({
  providedIn: 'root'
})
export class GetUserTrackingHandler implements GetUserTrackingQuery{
  constructor(private _authRepository:IAuthRepository){}

  public execute(params:SignInDREUGEL):Promise<UserTrack>{
    return this._authRepository.getUserTracking(params);
  }

}

import { Injectable } from "@angular/core";
import { SignInCommand } from "./sign-in.command";
import { IAuthRepository } from "app/domain/auth/auth.repository";
import { SignIn, UserData } from "app/domain/auth/sign-in.model";
@Injectable({
  providedIn: 'root'
})
export class SignInHandler implements SignInCommand{
  constructor(private _authRepository:IAuthRepository){}

  public execute(params:SignIn):Promise<UserData>{
    return this._authRepository.signIn(params);
  }

}

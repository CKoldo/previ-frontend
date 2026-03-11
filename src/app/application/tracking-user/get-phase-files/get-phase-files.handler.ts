import { Injectable } from "@angular/core";
import { ITrackingUserRepository } from "app/domain/tracking-user/tracking-user.repository";
import { GetPhaseFilesQuery } from "./get-phase-files.query";

@Injectable({
  providedIn: 'root'
})
export class GetPhaseFilesHandler implements GetPhaseFilesQuery {
  constructor(private _trackingUserRepository:ITrackingUserRepository){}

  public execute(localCode:string):Promise<any>{
    return this._trackingUserRepository.getPhaseFiles(localCode);
  }
}

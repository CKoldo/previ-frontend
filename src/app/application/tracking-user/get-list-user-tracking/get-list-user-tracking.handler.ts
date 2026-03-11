import { Injectable } from "@angular/core";
import { ITrackingUserRepository } from "app/domain/tracking-user/tracking-user.repository";
import { GetListUserTrackingQuery } from "./get-list-user-tracking.query";

@Injectable({
  providedIn: 'root'
})
export class GetListUserTrackingHandler implements GetListUserTrackingQuery {
  constructor(private _trackingUserRepository:ITrackingUserRepository){}

  public execute():Promise<any>{
    return this._trackingUserRepository.getListUserTracking();
  }
}

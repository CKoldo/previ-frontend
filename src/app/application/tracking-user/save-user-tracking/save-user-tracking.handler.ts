import { Injectable } from "@angular/core";
import { ITrackingUserRepository } from "app/domain/tracking-user/tracking-user.repository";
import { SaveUserTrackingCommand } from "./save-user-tracking.command";
import { TrackingUserData } from "app/domain/tracking-user/tracking-user.model";


@Injectable({
  providedIn: 'root'
})
export class SaveUserTrackingHandler implements SaveUserTrackingCommand {
  constructor(private _trackingUserRepository: ITrackingUserRepository) {}

  public execute(params: TrackingUserData): Promise<any> {
    return this._trackingUserRepository.saveUserTracking(params);
  }
}

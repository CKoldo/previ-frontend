import { Injectable } from "@angular/core";
import { ITrackingUserRepository } from "app/domain/tracking-user/tracking-user.repository";
import { HttpClient } from "@angular/common/http";
import { environment } from "environments/environment";
import { lastValueFrom } from "rxjs";
import { TrackingUserData } from "app/domain/tracking-user/tracking-user.model";

@Injectable()
export class TrackingUserRepository implements ITrackingUserRepository {
  private readonly _apiUrlBase: string;

  constructor(private _HttpClient: HttpClient) {
    this._apiUrlBase = environment.API_URL_BASE;
  }

  getListUserTracking() {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/listaraccesousuario`,
        null
      )
    );
  }

    saveUserTracking(params: TrackingUserData) {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/actualizaraccesousuario`,
        params
      )
    );
  }

  getPhaseFiles(localCode: string) {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/obtenerarchivos`,
        { "CODIGO_LOCAL": localCode }
      )
    );
  }
}

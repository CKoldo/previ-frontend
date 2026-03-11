import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ReportEntryData,
  ScheduleDateUpdate,
  StageStatusUpdate,
  SurveyConfiguration,
  SurveyData,
  SurveyDataInfo,
} from 'app/domain/survey/survey.model';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SurveyRepository implements ISurveyRepository {
  private readonly _apiUrlBase: string;

  constructor(private _HttpClient: HttpClient) {
    this._apiUrlBase = environment.API_URL_BASE;
  }

  saveStagePhase(params: SurveyData) {
    const formData = new FormData();

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        formData.append(key, (params as Record<string, any>)[key]);
      }
    }
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/insertar`,
        formData
      )
    );
  }

   getScheduleDates() {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/sistema/fase`,null
      )
    );
  }

  saveConfiguration(params: SurveyConfiguration) {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/insertarconfiguracion`,
        params
      )
    );
  }

  updateScheduleDates(params: ScheduleDateUpdate) {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/sistema/fase/actualizar`,
        params
      )
    );
  }

  updateStageStatus(params: StageStatusUpdate) {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/sistema/fase/actualizar/esactivo`,
        params
      )
    );
  }

  updateStagePhase(params: SurveyData) {
    const formData = new FormData();

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        formData.append(key, (params as Record<string, any>)[key]);
      }
    }
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/actualizar`,
        formData
      )
    );
  }

  updateConfiguration(params: SurveyConfiguration) {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/actualizarconfiguracion`,
        params
      )
    );
  }

  getSurveyData(params: SurveyDataInfo) {
    const payload: SurveyDataInfo & { [key: string]: any } = {
      ...params,
    };

    const numeroDocumento = this.resolveNumeroDocumentoFromStorage();
    if (numeroDocumento) {
      payload.NUMERO_DOCUMENTO = numeroDocumento;
    }

    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/obtener`,
        payload
      )
    );
  }

  generateReport(params: ReportEntryData) {
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/reporte/exportarregistros`,
        params
      )
    );
  }

  private resolveNumeroDocumentoFromStorage(): string | null {
    try {
      const raw = localStorage.getItem('dataUser');
      if (!raw) {
        return null;
      }
      const dataUser = JSON.parse(raw);
      const value =
        dataUser?.NUMERO_DOCUMENTO_IE ?? dataUser?.NUMERO_DOCUMENTO ?? null;
      return value ? String(value) : null;
    } catch (error) {
      console.error('Error al leer dataUser para obtener el número de documento', error);
      return null;
    }
  }
}

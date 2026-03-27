import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ReportEntryData,
  ScheduleDateEntry,
  ScheduleDateUpdate,
  SurveyConfiguration,
  SurveyData,
  SurveyDataInfo,
} from 'app/domain/survey/survey.model';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { convertYearToIdPadronAnio, convertIdPadronAnioToYear } from 'app/shared/utils/year-id-mapper.util';

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
        const value = (params as Record<string, any>)[key];
        
        // Convertir YEAR a ID_PADRON_ANIO
        if (key === 'YEAR' && value) {
          formData.append('ID_PADRON_ANIO', String(convertYearToIdPadronAnio(value)));
        } else if (key !== 'YEAR') {
          formData.append(key, value);
        }
      }
    }
    return lastValueFrom(
      this._HttpClient.post(
        `${this._apiUrlBase}api/transaccional/insertar`,
        formData
      )
    );
  }

  async getScheduleDates(): Promise<ScheduleDateEntry[]> {
    const response = await lastValueFrom(
      this._HttpClient.post<any[]>(`${this._apiUrlBase}api/sistema/fase`, null)
    );

    return Array.isArray(response)
      ? response.map((entry) => this.normalizeScheduleDateEntry(entry))
      : [];
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

  updateStagePhase(params: SurveyData) {
    const formData = new FormData();

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const value = (params as Record<string, any>)[key];
        
        // Convertir YEAR a ID_PADRON_ANIO
        if (key === 'YEAR' && value) {
          formData.append('ID_PADRON_ANIO', String(convertYearToIdPadronAnio(value)));
        } else if (key !== 'YEAR') {
          formData.append(key, value);
        }
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
    if (!payload.NUMERO_DOCUMENTO && numeroDocumento) {
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

  private normalizeScheduleDateEntry(entry: any): ScheduleDateEntry {
    const fechaInicioFase = entry?.FECHA_INICIO_FASE ?? entry?.FECHA_INICIO ?? null;
    const fechaFinFase = entry?.FECHA_FIN_FASE ?? entry?.FECHA_FIN ?? null;
    const fechaInicioReporte =
      entry?.FECHA_INICIO_REPORTE ?? entry?.fecha_inicio_reporte ?? null;
    const fechaFinReporte =
      entry?.FECHA_FIN_REPORTE ?? entry?.fecha_fin_reporte ?? null;
    const fechaInicioValidacion =
      entry?.FECHA_INICIO_VALIDACION ?? entry?.fecha_inicio_validacion ?? null;
    const fechaFinValidacion =
      entry?.FECHA_FIN_VALIDACION ?? entry?.fecha_fin_validacion ?? null;
    const esActivoFase = this.normalizeBooleanFlag(
      entry?.ES_ACTIVO_FASE ?? entry?.ES_ACTIVO
    );
    const estadoRegistroReporte = this.normalizeBooleanFlag(
      entry?.ESTADO_REGISTRO_REPORTE ?? entry?.estado_registro_reporte
    );
    const estadoRegistroValidacion = this.normalizeBooleanFlag(
      entry?.ESTADO_REGISTRO_VALIDACION ?? entry?.estado_registro_validacion
    );
    const esActivoReporte = this.resolveProfileAvailability({
      explicitActive: entry?.ES_ACTIVO_REPORTE,
      globalActive: esActivoFase,
      profileEnabled: estadoRegistroReporte,
      startDate: fechaInicioReporte ?? fechaInicioFase,
      endDate: fechaFinReporte ?? fechaFinFase,
      legacyActive: entry?.ES_ACTIVO,
    });
    const esActivoValidacion = this.resolveProfileAvailability({
      explicitActive: entry?.ES_ACTIVO_VALIDACION,
      globalActive: esActivoFase,
      profileEnabled: estadoRegistroValidacion,
      startDate: fechaInicioValidacion,
      endDate: fechaFinValidacion,
      legacyActive: entry?.ES_ACTIVO_VALIDACION,
    });

    return {
      ID_FASE: Number(entry?.ID_FASE ?? 0),
      FASE: entry?.FASE != null ? String(entry.FASE) : null,
      ANIO_FASE:
        entry?.ANIO_FASE != null ? String(entry.ANIO_FASE) : null,
      YEAR:
        entry?.ID_PADRON_ANIO != null
          ? convertIdPadronAnioToYear(entry.ID_PADRON_ANIO)
          : entry?.YEAR != null
            ? String(entry.YEAR)
            : entry?.ANIO_FASE != null
              ? String(entry.ANIO_FASE)
              : null,
      FECHA_INICIO_FASE: fechaInicioFase,
      FECHA_FIN_FASE: fechaFinFase,
      FECHA_INICIO_REPORTE: fechaInicioReporte,
      FECHA_FIN_REPORTE: fechaFinReporte,
      FECHA_INICIO_VALIDACION: fechaInicioValidacion,
      FECHA_FIN_VALIDACION: fechaFinValidacion,
      ES_ACTIVO_FASE: esActivoFase,
      ES_ACTIVO_REPORTE: esActivoReporte,
      ES_ACTIVO_VALIDACION: esActivoValidacion,
      ESTADO_REGISTRO_REPORTE: estadoRegistroReporte,
      ESTADO_REGISTRO_VALIDACION: estadoRegistroValidacion,
      ESTADO_REGISTRO: this.normalizeBooleanFlag(entry?.ESTADO_REGISTRO),
    };
  }

  private resolveProfileAvailability(params: {
    explicitActive: unknown;
    globalActive: boolean;
    profileEnabled: boolean;
    startDate: string | null;
    endDate: string | null;
    legacyActive?: unknown;
  }): boolean {
    const explicitActive = this.normalizeNullableBooleanFlag(params.explicitActive);
    if (explicitActive !== null) {
      return explicitActive;
    }

    const hasProfileMetadata =
      params.startDate !== null || params.endDate !== null || params.profileEnabled;
    if (hasProfileMetadata) {
      return (
        params.globalActive &&
        params.profileEnabled &&
        this.isCurrentDateWithinRange(params.startDate, params.endDate)
      );
    }

    return this.normalizeBooleanFlag(params.legacyActive);
  }

  private normalizeNullableBooleanFlag(value: unknown): boolean | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return this.normalizeBooleanFlag(value);
  }

  private isCurrentDateWithinRange(
    startDate: string | null,
    endDate: string | null
  ): boolean {
    const normalizedStart = this.normalizeDateOnly(startDate);
    const normalizedEnd = this.normalizeDateOnly(endDate);

    if (!normalizedStart || !normalizedEnd) {
      return false;
    }

    const today = this.normalizeDateOnly(new Date().toISOString());
    if (!today) {
      return false;
    }

    return today >= normalizedStart && today <= normalizedEnd;
  }

  private normalizeDateOnly(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }

  private normalizeBooleanFlag(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === '1' || normalized === 'true';
    }

    return false;
  }
}

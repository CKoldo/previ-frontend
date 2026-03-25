import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GetTokenQuery } from 'app/application/auth/get-token/get-token.query';
import { SignInCommand } from 'app/application/auth/sign-in/sign-in.command';
import { SignInHandler } from 'app/application/auth/sign-in/sign-in.handler';
import { GetTokenHandler } from 'app/application/auth/get-token/get-token.handler';
import { IAuthRepository } from 'app/domain/auth/auth.repository';
import { AuthRepository } from 'app/infrastructure/repositories/auth.repository';
import { InputNumberModule } from 'primeng/inputnumber';
import Swal from 'sweetalert2';
import { GetUserTrackingHandler } from 'app/application/auth/get-user-tracking/get-user-tracking.handler';
import { GetUserTrackingQuery } from 'app/application/auth/get-user-tracking/get-user-tracking.query';
import { GetScheduleDatesHandler } from 'app/application/survey/get-schedule-dates/get-schedule-dates.handler';
import { GetScheduleDatesQuery } from 'app/application/survey/get-schedule-dates/get-schedule-dates.query';
import { GetMineduDataHandler } from 'app/application/auth/get-minedu-data/get-minedu-data.handler';
import { GetMineduDataQuery } from 'app/application/auth/get-minedu-data/get-minedu-data.query';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { SurveyRepository } from 'app/infrastructure/repositories/survey.repository';
import { ScheduleYear, getActiveStageYear, setActiveStageYear } from 'app/shared/utils/stage-storage.util';
import { resolveUiStage } from 'app/shared/utils/stage-year-mapper.util';

@Component({
  selector: 'app-sign-in',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    InputNumberModule,
  ],
  providers: [
    { provide: IAuthRepository, useClass: AuthRepository },
    { provide: ISurveyRepository, useClass: SurveyRepository },
    { provide: SignInCommand, useClass: SignInHandler },
    { provide: GetTokenQuery, useClass: GetTokenHandler },
    { provide: GetUserTrackingQuery, useClass: GetUserTrackingHandler },
    { provide: GetScheduleDatesQuery, useClass: GetScheduleDatesHandler },
    { provide: GetMineduDataQuery, useClass: GetMineduDataHandler },
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  formGroup!: FormGroup;

  institution: any[] | undefined;

  selectedInstitution: any | undefined;

  isLoading: boolean = false;

  private readonly trackingPhaseRules: Record<ScheduleYear, { min: number; max: number }> = {
    '2025': { min: 1, max: 5 },
    '2026': { min: 6, max: 10 },
  };

  constructor(
    private _fb: FormBuilder,
    private _Router: Router,
    private _GetTokenQuery: GetTokenQuery,
    private _GetUserTrackingQuery: GetUserTrackingQuery,
    private _GetScheduleDatesQuery: GetScheduleDatesQuery,
    private _GetMineduDataQuery: GetMineduDataQuery,
    private _SignInCommand: SignInCommand
  ) {
    this.createFormGroup();
  }

  ngOnInit() {
    localStorage.clear();
    this.institution = [
      { name: 'IE', code: 1 },
      { name: 'UGEL', code: 2 },
      { name: 'DRE', code: 3 },
      { name: 'MINEDU', code: 4 },
    ];
  }

  private createFormGroup() {
    this.formGroup = this._fb.group({
      TIPO_INSTITUCION: [{ value: 1, disabled: false }, [Validators.required]],
      NUMERO_DOCUMENTO: [{ value: '', disabled: false }, [Validators.required]],
      //NUMERO_DOCUMENTO_IE: [{ value: '', disabled: true }, [Validators.required]],
      CODIGO_LOCAL: [{ value: '', disabled: false }, [Validators.required]],
    });

    this.TIPO_INSTITUCION?.valueChanges.subscribe((v) => {
      this.CODIGO_LOCAL?.clearValidators();
      this.CODIGO_LOCAL?.setValue('');
      if (v == 1) {
        this.CODIGO_LOCAL?.setValidators([Validators.required]);
      }
      this.CODIGO_LOCAL?.updateValueAndValidity();
    });
  }

  get TIPO_INSTITUCION() {
    return this.formGroup.get('TIPO_INSTITUCION');
  }
  get NUMERO_DOCUMENTO() {
    return this.formGroup.get('NUMERO_DOCUMENTO');
  }
  //get NUMERO_DOCUMENTO_IE() {
  //  return this.formGroup.get('NUMERO_DOCUMENTO_IE');
  //}
  get CODIGO_LOCAL() {
    return this.formGroup.get('CODIGO_LOCAL');
  }

  public async getToken() {
    const result = await this._GetTokenQuery.execute();
    if (result?.token == null) {
      return;
    }
    localStorage.setItem('access_token', result?.token);
    return result?.token;
  }

  public async signIn() {
    if (this.isLoading) {
      return;
    }

    try {
      this.isLoading = true;

      const token: any = await this.getToken();
      if (token) {
        let objLog: any = {
          NUMERO_DOCUMENTO: this.NUMERO_DOCUMENTO?.value.toString(),
          //NUMERO_DOCUMENTO_IE: this.NUMERO_DOCUMENTO_IE?.value.toString(),
          CODIGO_LOCAL: this.CODIGO_LOCAL?.value.toString(),
        };
        if (this.TIPO_INSTITUCION?.value != 1) {
          delete objLog?.CODIGO_LOCAL;
          objLog['ID_TIPO_INSTITUCION'] = this.TIPO_INSTITUCION?.value;
        }

        let result = null;

        switch (this.TIPO_INSTITUCION?.value) {
          case 1:
            result = await this._SignInCommand.execute(objLog);
            break;
          case 4:
            result = await this._GetMineduDataQuery.execute(objLog);
            break;
          default:
            result = await this._GetUserTrackingQuery.execute(objLog);
            break;
        }

        // const result: any = await (this.TIPO_INSTITUCION?.value == 1
        //   ? this._SignInCommand.execute(objLog)
        //   : this._GetUserTrackingQuery.execute(objLog));

        if (result) {
          this.handleUserData(result);
        } else {
          localStorage.clear();
          Swal.fire({
            text: 'No se encontro el usuario',
            icon: 'warning',
          });
        }
      }
    } catch (error) {
      console.log(error);
      localStorage.clear();
      Swal.fire({
        text: 'No se encontro el usuario',
        icon: 'warning',
      });
    } finally {
      setTimeout(() => {
        this.isLoading = false;
      }, 200);
    }
  }

  private async handleUserData(datos: any) {
    //console.log('[SignIn] Datos obtenidos del servicio de tracking:', datos);
    if (this.TIPO_INSTITUCION?.value == 1) {
      datos = datos[datos.length - 1];
      if (datos?.DATOS_JSON) {
        datos.REGISTRADO = true;

        const stagePayloadByYear = this.prepareStagePayloadByYear(datos.DATOS_JSON);
        this.persistStagePayloadByYear(stagePayloadByYear);

        const activeYear = getActiveStageYear();
        const fallbackStages = stagePayloadByYear[activeYear] ?? [];
        datos.DATOS_JSON = JSON.stringify(fallbackStages);
      }

      const resultDates = await this._GetScheduleDatesQuery.execute();

      const baseDateEnableByYear: Record<ScheduleYear, any[]> = {
        '2025': [
          {
            stage: 1,
            enable: false,
            start: null,
            end: null,
          },
          {
            stage: 2,
            enable: false,
            start: null,
            end: null,
          },
          {
            stage: 3,
            enable: false,
            start: null,
            end: null,
          },
          {
            stage: 4,
            enable: false,
            start: null,
            end: null,
          },
          {
            stage: 5,
            enable: true,
            start: null,
            end: null,
          },
        ],
        '2026': [
          {
            stage: 6,
            enable: false,
            start: null,
            end: null,
          },
          {
            stage: 7,
            enable: false,
            start: null,
            end: null,
          },
          {
            stage: 8,
            enable: false,
            start: null,
            end: null,
          },
          {
            stage: 9,
            enable: false,
            start: null,
            end: null,
          },
          {
            stage: 10,
            enable: false,
            start: null,
            end: null,
          },
        ],
      };

      const normalizeEnableFromApi = (value: any): boolean | null => {
        if (value === undefined || value === null || value === '') {
          return null;
        }
        if (typeof value === 'boolean') {
          return value;
        }
        const numericValue = Number(value);
        if (Number.isNaN(numericValue)) {
          return null;
        }
        return numericValue === 1;
      };

      const normalizeYearFromApi = (value: any): ScheduleYear | null => {
        if (value === undefined || value === null) {
          return null;
        }
        const parsed = String(value).trim();
        if (!parsed) {
          return null;
        }
        return parsed === '2026' ? '2026' : parsed === '2025' ? '2025' : null;
      };

      const dateEnableByYear = (['2025', '2026'] as ScheduleYear[]).reduce(
        (acc, year) => {
          acc[year] = baseDateEnableByYear[year].map((item: any) => {
            const apiEntry = resultDates.find((result: any) => {
              if (Number(result.ID_FASE) !== Number(item.stage)) {
                return false;
              }
              const entryYear = normalizeYearFromApi(result?.YEAR);
              return entryYear ? entryYear === year : true;
            });
            const enableFromApi = normalizeEnableFromApi(apiEntry?.ES_ACTIVO_REPORTE);
            const phaseEnabledFromApi = normalizeEnableFromApi(apiEntry?.ES_ACTIVO_FASE);
            return {
              ...item,
              start: apiEntry?.FECHA_INICIO_REPORTE ?? item.start,
              end: apiEntry?.FECHA_FIN_REPORTE ?? item.end,
              enable: enableFromApi ?? item.enable ?? false,
              phase_enabled: phaseEnabledFromApi ?? true,
              YEAR: year,
              year,
            };
          });
          return acc;
        },
        { '2025': [], '2026': [] } as Record<ScheduleYear, any[]>
      );

      localStorage.setItem('dataStageEnable', JSON.stringify(dateEnableByYear));
      //console.log('peticion al sign in');
      //console.log('estructura parseada:', dateEnableByYear);
      //console.log('del backend:', resultDates);
      localStorage.setItem('dataUser', JSON.stringify(datos));
      this._Router.navigate(['/survey']);
      return;
    }

    if (datos.length === 0) {
      Swal.fire({
        text: 'No se encontraron registros para el usuario',
        icon: 'warning',
      });
      return;
    }

    let obj: any = {
      NUMERO_DOCUMENTO: this.NUMERO_DOCUMENTO?.value,
      //NUMERO_DOCUMENTO_IE: this.NUMERO_DOCUMENTO_IE?.value,
      TIPO_INSTITUCION: this.TIPO_INSTITUCION?.value,
      DRE: '',
      UGEL: '',
      DRE_ORI: '',
      UGEL_ORI: '',
      MINEDU: '',
    };

    if (this.TIPO_INSTITUCION?.value == 2) {
      obj.DRE = 'DRE: ' + datos[0]?.DRE;
      obj.UGEL = 'UGEL: ' + datos[0]?.UGEL;
      obj.DRE_ORI = datos[0]?.DRE;
      obj.UGEL_ORI = datos[0]?.UGEL;
    }

    if (this.TIPO_INSTITUCION?.value == 3) {
      obj.DRE = 'DRE: ' + datos[0]?.DRE;
      obj.DRE_ORI = datos[0]?.DRE;
      obj.UGEL = '';
    }

    if (this.TIPO_INSTITUCION?.value == 4) {
      obj.MINEDU = 'MINEDU: ';
    }

    const trackingPayloadByYear = this.prepareTrackingDataByYear(datos);

    localStorage.setItem('dataUser', JSON.stringify(obj));
    localStorage.setItem('dataTracking', JSON.stringify(trackingPayloadByYear));

    if (this.TIPO_INSTITUCION?.value == 4) {
      this._Router.navigate(['/tracking-user']);
    } else {
      this._Router.navigate(['/tracking']);
    }
  }

  private prepareStagePayloadByYear(rawPayload: any): Partial<Record<ScheduleYear, any[]>> {
    const grouped = this.extractStagePayloadByYear(rawPayload);
    const hasData = Object.values(grouped).some(
      (collection) => Array.isArray(collection) && collection.length > 0
    );

    const normalized: Partial<Record<ScheduleYear, any[]>> = {};

    (['2025', '2026'] as ScheduleYear[]).forEach((year) => {
      const entries = grouped[year];
      if (entries && entries.length) {
        normalized[year] = this.normalizeStageCollection(entries, year);
      }
    });

    if (!hasData) {
      normalized['2025'] = this.ensureStageFiveEntry([], '2025');
    }

    return normalized;
  }

  private persistStagePayloadByYear(payload: Partial<Record<ScheduleYear, any[]>>): void {
    const years = Object.keys(payload) as ScheduleYear[];
    if (!years.length) {
      return;
    }

    const previousYear = getActiveStageYear();

    years.forEach((year) => {
      const entries = payload[year];
      if (entries === undefined) {
        return;
      }
      setActiveStageYear(year);
      localStorage.setItem('stage', JSON.stringify(entries));
    });

    setActiveStageYear(previousYear);
  }

  private extractStagePayloadByYear(rawPayload: any): Partial<Record<ScheduleYear, any[]>> {
    const parsed = this.safeParseStagePayload(rawPayload);
    if (!parsed) {
      return {};
    }

    if (Array.isArray(parsed)) {
      return parsed.reduce((acc, entry) => {
        const year = this.resolveEntryYear(entry);
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year]!.push(entry);
        return acc;
      }, {} as Partial<Record<ScheduleYear, any[]>>);
    }

    if (typeof parsed === 'object') {
      const result: Partial<Record<ScheduleYear, any[]>> = {};
      (['2025', '2026'] as ScheduleYear[]).forEach((year) => {
        const bucket = (parsed as Record<string, any>)[year];
        if (Array.isArray(bucket)) {
          result[year] = bucket;
        }
      });
      return result;
    }

    return {};
  }

  private safeParseStagePayload(rawPayload: any): any {
    if (rawPayload === null || rawPayload === undefined) {
      return null;
    }

    if (typeof rawPayload === 'string') {
      try {
        return JSON.parse(rawPayload);
      } catch {
        return null;
      }
    }

    return rawPayload;
  }

  private resolveEntryYear(entry: any): ScheduleYear {
    const value = entry?.YEAR ?? entry?.year;
    return value === '2026' ? '2026' : '2025';
  }

  private normalizeStageCollection(collection: any[], year: ScheduleYear): any[] {
    const sanitized = collection
      .filter(Boolean)
      .map((entry) => this.normalizeStageEntry(entry, year))
      .filter((entry) => this.coerceStageNumber(entry) > 0);

    const withStageFive = this.ensureStageFiveEntry(sanitized, year);

    return withStageFive.sort(
      (a, b) => this.coerceStageNumber(a) - this.coerceStageNumber(b)
    );
  }

  private normalizeStageEntry(entry: any, year: ScheduleYear): any {
    const apiStageNumber = this.coerceStageNumber(entry);
    const mappedStage = resolveUiStage(apiStageNumber, year);

    const normalizedSurvey = Array.isArray(entry?.survey)
      ? entry.survey.map((survey: any) => this.normalizeSurveyEntry(survey, mappedStage, year))
      : entry.survey;

    const normalizedLabel =
      typeof entry?.labelStage === 'string'
        ? entry.labelStage.replace(/\d+/, String(mappedStage))
        : `Fase ${mappedStage}`;

    return {
      ...entry,
      stage: mappedStage,
      labelStage: normalizedLabel,
      survey: normalizedSurvey,
      YEAR: year,
      year,
    };
  }

  private normalizeSurveyEntry(survey: any, stage: number, year: ScheduleYear): any {
    if (!survey || typeof survey !== 'object') {
      return survey;
    }

    const surveyId = typeof survey.survey === 'string' ? survey.survey : '';
    const [, phasePart] = surveyId.split('-');
    const normalizedId = phasePart ? `${stage}-${phasePart}` : surveyId || `${stage}`;

    return {
      ...survey,
      survey: normalizedId,
      YEAR: year,
      year,
    };
  }

  private ensureStageFiveEntry(entries: any[], year: ScheduleYear): any[] {
    const exists = entries.some((entry) => this.coerceStageNumber(entry) === 5);
    if (exists) {
      return entries;
    }

    return [...entries, this.buildStageFiveSkeleton(year)];
  }

  private buildStageFiveSkeleton(year: ScheduleYear) {
    return {
      stage: 5,
      labelStage: 'Fase 5',
      enable: true,
      dateEnable: '',
      survey: [
        {
          label: 'Tarea 1',
          survey: '5-1',
          enable: false,
          complete: true,
          prevComplete: false,
          countQuestion: 1,
          dataSaved: null,
          YEAR: year,
          year,
        },
        
      ],
      YEAR: year,
      year,
    };
  }

  private coerceStageNumber(entry: any): number {
    const rawStage = entry?.stage ?? entry?.STAGE ?? entry?.labelStage;
    const parsed = Number(rawStage);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  /*
  private prepareTrackingDataByYear(rawEntries: any): Record<ScheduleYear, any[]> {
    if (this.isTrackingYearMap(rawEntries)) {
      return this.normalizeTrackingYearMap(rawEntries);
    }
    if (!Array.isArray(rawEntries)) {
      return this.createEmptyTrackingPayload();
    }
    const grouped = this.groupTrackingEntriesByYear(rawEntries);
    return this.normalizeTrackingYearMap(grouped);
  }*/
  private prepareTrackingDataByYear(rawEntries: any[]): Record<ScheduleYear, any[]> {
    const base = Array.isArray(rawEntries) ? rawEntries : [];
    return {
      '2025': base.map((entry) => this.stripPhaseFieldsOutsideRange(entry, { min: 1, max: 5 })),
      '2026': base.map((entry) => this.stripPhaseFieldsOutsideRange(entry, { min: 6, max: 10 })),
    };
  }

  private groupTrackingEntriesByYear(entries: any[]): Record<ScheduleYear, any[]> {
    return entries.reduce<Record<ScheduleYear, any[]>>((acc, entry) => {
      const year = this.resolveTrackingEntryYear(entry);
      acc[year].push(entry);
      return acc;
    }, this.createEmptyTrackingPayload());
  }

  private resolveTrackingEntryYear(entry: any): ScheduleYear {
    const candidates = [
      entry?.YEAR,
      entry?.year,
      entry?.ANIO,
      entry?.anio,
      entry?.ANIO_SEGUIMIENTO,
      entry?.anioSeguimiento,
      entry?.ANIO_PROCESO,
      entry?.anio_proceso,
    ];

    const normalized = this.normalizeYearCandidate(candidates);
    return normalized === '2026' ? '2026' : '2025';
  }

  private normalizeYearCandidate(candidates: any[]): string | null {
    for (const candidate of candidates) {
      const normalized = this.coerceYearValue(candidate);
      if (normalized) {
        return normalized;
      }
    }
    return null;
  }

  private coerceYearValue(value: any): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        return null;
      }
      return String(Math.trunc(value));
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      const numeric = Number(trimmed);
      if (!Number.isNaN(numeric)) {
        return String(Math.trunc(numeric));
      }

      return trimmed;
    }

    return null;
  }

  private createEmptyTrackingPayload(): Record<ScheduleYear, any[]> {
    return {
      '2025': [],
      '2026': [],
    };
  }

  private isTrackingYearMap(value: any): value is Partial<Record<ScheduleYear, any[]>> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }

    return (['2025', '2026'] as ScheduleYear[]).some((year) =>
      Array.isArray((value as Record<string, any>)[year])
    );
  }

  private normalizeTrackingYearMap(
    value: Partial<Record<ScheduleYear, any[]>>
  ): Record<ScheduleYear, any[]> {
    const year2025 = Array.isArray(value['2025']) ? value['2025'] : [];
    const year2026 = Array.isArray(value['2026']) ? value['2026'] : [];

    return {
      '2025': this.sanitizeYearEntries(year2025, '2025'),
      '2026': this.sanitizeYearEntries(year2026, '2026'),
    };
  }

  private sanitizeYearEntries(entries: any[], year: ScheduleYear): any[] {
    if (!Array.isArray(entries)) {
      return [];
    }

    const rule = this.trackingPhaseRules[year];
    if (!rule) {
      return entries;
    }

    return entries.map((entry) => this.stripPhaseFieldsOutsideRange(entry, rule));
  }

  private stripPhaseFieldsOutsideRange(entry: any, rule: { min: number; max: number }): any {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return entry;
    }

    const sanitized = { ...entry };
    Object.keys(sanitized).forEach((key) => {
      const upperKey = key.toUpperCase();
      const match = upperKey.match(/^FASE(\d+)_TAREA\d+$/);
      if (!match) {
        return;
      }

      const phaseNumber = Number(match[1]);
      if (
        Number.isFinite(phaseNumber) &&
        (phaseNumber < rule.min || phaseNumber > rule.max)
      ) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }
}

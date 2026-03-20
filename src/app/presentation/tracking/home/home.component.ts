import { ReportService } from './../../../shared/services/report.service';
import { LoadingService } from './../../../shared/services/loading.service';
import { ConfigSurvey } from './../../../shared/constants/configs';
import { TemporalSaveService } from './../../../shared/services/temporal-save.service';
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import Swal from 'sweetalert2';
import { SaveStagePhaseCommand } from 'app/application/survey/save-stage-phase/save-stage-phase.command';
import { SaveStagePhaseHandler } from 'app/application/survey/save-stage-phase/save-stage-phase.handler';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { SurveyRepository } from 'app/infrastructure/repositories/survey.repository';
import { SaveConfigurationCommand } from 'app/application/survey/save-configuration/save-configuration.command';
import { SaveConfigurationHandler } from 'app/application/survey/save-configuration/save-configuration.handler';
import { Subscription, Subject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';
import { TableCheckerComponent } from '../components/table-checker/table-checker.component';
import { GenerateReportCommand } from 'app/application/survey/generate-report/generate-report.command';
import { GenerateReportHandler } from 'app/application/survey/generate-report/generate-report.handler';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { GetUserTrackingQuery } from 'app/application/auth/get-user-tracking/get-user-tracking.query';
import { GetUserTrackingHandler } from 'app/application/auth/get-user-tracking/get-user-tracking.handler';
import { IAuthRepository } from 'app/domain/auth/auth.repository';
import { AuthRepository } from 'app/infrastructure/repositories/auth.repository';
import {
  ScheduleYear,
  setActiveStageYear,
} from 'app/shared/utils/stage-storage.util';

import { prepareDataForReport } from './report';

@Component({
  selector: 'app-home',
  imports: [CommonModule,
    FormsModule,
    //FooterComponent, 
    TableCheckerComponent, ButtonModule, SelectModule],
  providers: [
    { provide: IAuthRepository, useClass: AuthRepository },
    { provide: ISurveyRepository, useClass: SurveyRepository },
    { provide: SaveStagePhaseCommand, useClass: SaveStagePhaseHandler },
    { provide: SaveConfigurationCommand, useClass: SaveConfigurationHandler },
    { provide: GenerateReportCommand, useClass: GenerateReportHandler },
    { provide: GetUserTrackingQuery, useClass: GetUserTrackingHandler },
    LoadingService,
    ReportService,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  isLoadingDownload: boolean = false;
  isRefreshing: boolean = false;
  refreshVersion: number = 0;
  globalSearchTerm: string = '';
  selectedScheduleYear: ScheduleYear | null = null;
  yearAvailability: Record<ScheduleYear, boolean> = {
    '2025': false,
    '2026': false,
  };

  private readonly reportTemplates: Record<
    ScheduleYear,
    { templatePath: string; fileName: string }
  > = {
    '2025': {
      templatePath: 'assets/template/reporte-previ-formato.xlsx',
      fileName: 'reporte-previ.xlsx',
    },
    '2026': {
      templatePath: 'assets/template/reporte-previ-formato-2026.xlsx',
      fileName: 'reporte-previ-2026.xlsx',
    },
  };

  readonly trackingYearCards: ReadonlyArray<{
    year: ScheduleYear;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      year: '2025',
      title: 'Seguimiento 2025',
      description: 'Fases registradas en el plan vigente.',
      icon: 'pi-calendar',
    },
    {
      year: '2026',
      title: 'Seguimiento 2026',
      description: 'Registros piloto del próximo año.',
      icon: 'pi-calendar-clock',
    },
  ];

  constructor(
    private _reportService: ReportService,
    private _GenerateReportCommand: GenerateReportCommand,
    private _GetUserTrackingQuery: GetUserTrackingQuery,
  ) {}

  ngOnInit(): void {
    this.refreshYearAvailability();
  }

  get hasSelectedScheduleYear(): boolean {
    return this.selectedScheduleYear !== null;
  }

  get hasDataForSelectedYear(): boolean {
    if (!this.selectedScheduleYear) {
      return false;
    }

    return !!this.yearAvailability[this.selectedScheduleYear];
  }

  get trackingYearOptions(): Array<{
    year: ScheduleYear;
    title: string;
    description: string;
    icon: string;
    disabled: boolean;
  }> {
    return this.trackingYearCards.map((card) => ({
      ...card,
      disabled: !this.yearAvailability[card.year],
    }));
  }

  selectScheduleYear(year: ScheduleYear | null) {
    if (this.selectedScheduleYear === year) {
      return;
    }

    this.selectedScheduleYear = year;
    if (year) {
      setActiveStageYear(year);
    }
    this.refreshYearAvailability();
  }

  async prepareDataForReport() {
    if (!this.selectedScheduleYear) {
      return null;
    }

    const conf = await prepareDataForReport(
      this._GenerateReportCommand,
      window.localStorage,
      this.selectedScheduleYear,
    );
    //console.log('Data preparada para reporte:', conf);
    return conf;
  }

  async generateReport() {
    if (this.isLoadingDownload) {
      return;
    }

    if (!this.selectedScheduleYear) {
      Swal.fire({
        text: 'Seleccione un año para mostrar.',
        icon: 'info',
      });
      return;
    }

    this.isLoadingDownload = true;

    const dataEntry: any = await this.prepareDataForReport();

    if (!dataEntry) {
      this.isLoadingDownload = false;
      return;
    }

    const templateMeta = this.reportTemplates[this.selectedScheduleYear];

    this._reportService
      .exportarReportePorRangos(dataEntry, templateMeta)
      .then(() => {
        //console.log('Reporte generado exitosamente', dataEntry);
        this.isLoadingDownload = false;
      })
      .catch((error) => {
        console.error('Error al generar reporte:', error);
        this.isLoadingDownload = false;
      });
  }

  async refresh() {
    if (this.isRefreshing) {
      return;
    }

    const userData = this.readStoredUserData();
    if (!userData?.NUMERO_DOCUMENTO || !userData?.TIPO_INSTITUCION) {
      Swal.fire({
        text: 'No se pudo identificar la sesión para actualizar el tracking.',
        icon: 'warning',
      });
      return;
    }

    this.isRefreshing = true;

    try {
      const payload = {
        NUMERO_DOCUMENTO: String(userData.NUMERO_DOCUMENTO),
        ID_TIPO_INSTITUCION: Number(userData.TIPO_INSTITUCION),
      };

      const response = await this._GetUserTrackingQuery.execute(payload);
      const normalizedTracking = this.prepareTrackingDataByYear(response);

      localStorage.setItem('dataTracking', JSON.stringify(normalizedTracking));

      this.refreshYearAvailability();
      this.refreshVersion += 1;

      Swal.fire({
        text: 'La información de tracking se actualizó correctamente.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error al actualizar el tracking:', error);
      Swal.fire({
        text: 'No se pudo actualizar la información del tracking.',
        icon: 'error',
      });
    } finally {
      this.isRefreshing = false;
    }
  }

  private refreshYearAvailability() {
    this.yearAvailability = this.computeYearAvailability();
  }

  private readStoredUserData(): { NUMERO_DOCUMENTO?: string; TIPO_INSTITUCION?: number } | null {
    const raw = localStorage.getItem('dataUser');

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn('No se pudo leer la sesión almacenada del usuario', error);
      return null;
    }
  }

  private computeYearAvailability(): Record<ScheduleYear, boolean> {
    const payload = this.readTrackingPayload();
    return {
      '2025': payload['2025'].length > 0,
      '2026': payload['2026'].length > 0,
    };
  }

  private readTrackingPayload(): Record<ScheduleYear, any[]> {
    const raw = localStorage.getItem('dataTracking');
    const emptyPayload: Record<ScheduleYear, any[]> = {
      '2025': [],
      '2026': [],
    };

    if (!raw) {
      return emptyPayload;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return { ...emptyPayload, '2025': parsed };
      }
      const normalized: Record<ScheduleYear, any[]> = { ...emptyPayload };
      (['2025', '2026'] as ScheduleYear[]).forEach((year) => {
        const bucket = (parsed as Record<string, any>)[year];
        if (Array.isArray(bucket)) {
          normalized[year] = bucket;
        }
      });
      return normalized;
    } catch (error) {
      console.warn('No se pudo leer los datos de tracking por año', error);
      return emptyPayload;
    }
  }

  private prepareTrackingDataByYear(rawEntries: any): Record<ScheduleYear, any[]> {
    const base = Array.isArray(rawEntries) ? rawEntries : [];
    return {
      '2025': base.map((entry) =>
        this.stripPhaseFieldsOutsideRange(entry, { min: 1, max: 5 }),
      ),
      '2026': base.map((entry) =>
        this.stripPhaseFieldsOutsideRange(entry, { min: 6, max: 10 }),
      ),
    };
  }

  private stripPhaseFieldsOutsideRange(
    entry: any,
    rule: { min: number; max: number },
  ): any {
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

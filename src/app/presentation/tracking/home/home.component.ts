import { ReportService } from './../../../shared/services/report.service';
import { LoadingService } from './../../../shared/services/loading.service';
import { ConfigSurvey } from './../../../shared/constants/configs';
import { TemporalSaveService } from './../../../shared/services/temporal-save.service';
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
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
import {
  ScheduleYear,
  getActiveStageYear,
  setActiveStageYear,
} from 'app/shared/utils/stage-storage.util';

import { prepareDataForReport } from './report';

@Component({
  selector: 'app-home',
  imports: [CommonModule, 
    //FooterComponent, 
    TableCheckerComponent, ButtonModule],
  providers: [
    { provide: ISurveyRepository, useClass: SurveyRepository },
    { provide: SaveStagePhaseCommand, useClass: SaveStagePhaseHandler },
    { provide: SaveConfigurationCommand, useClass: SaveConfigurationHandler },
    { provide: GenerateReportCommand, useClass: GenerateReportHandler },
    LoadingService,
    ReportService,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  isLoadingDownload: boolean = false;
  selectedScheduleYear: ScheduleYear = getActiveStageYear();
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
  ) {}

  ngOnInit(): void {
    this.refreshYearAvailability();
    this.ensureSelectedYearHasData();
  }

  get hasDataForSelectedYear(): boolean {
    return !!this.yearAvailability[this.selectedScheduleYear];
  }

  selectScheduleYear(year: ScheduleYear) {
    if (this.selectedScheduleYear === year) {
      return;
    }

    this.selectedScheduleYear = year;
    setActiveStageYear(year);
    this.refreshYearAvailability();
  }

  async prepareDataForReport() {
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

  private refreshYearAvailability() {
    this.yearAvailability = this.computeYearAvailability();
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

  private ensureSelectedYearHasData() {
    if (this.yearAvailability[this.selectedScheduleYear]) {
      return;
    }

    const fallback = (['2025', '2026'] as ScheduleYear[]).find(
      (year) => this.yearAvailability[year],
    );

    if (fallback) {
      this.selectedScheduleYear = fallback;
      setActiveStageYear(fallback);
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { GetScheduleDatesHandler } from 'app/application/survey/get-schedule-dates/get-schedule-dates.handler';
import { UpdateStageStatusHandler } from 'app/application/survey/update-stage-status/update-stage-status.handler';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { SurveyRepository } from 'app/infrastructure/repositories/survey.repository';
import { ConfigSurvey } from 'app/shared/constants/configs';
import { Router } from '@angular/router';

interface StageEnableEntry {
  stage: number;
  enable: boolean;
  start?: string;
  end?: string;
}

interface StageEnableRow {
  stage: number;
  labelStage: string;
  start: string;
  end: string;
  enable: boolean;
}

interface YearOption {
  year: number;
  start: number;
  end: number;
}

@Component({
  selector: 'app-table-edit-fin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-edit-fin.component.html',
  styleUrl: './table-edit-fin.component.css',
  providers: [{ provide: ISurveyRepository, useClass: SurveyRepository }],
})
export class TableEditFinComponent implements OnInit {
  rows: StageEnableRow[] = [];
  savingStage: number | null = null;
  loading = false;
  selectedYear: number | null = null;
  readonly yearOptions: YearOption[] = [
    { year: 2025, start: 0, end: 5 },
    { year: 2026, start: 5, end: 10 },
  ];

  constructor(
    private readonly _getScheduleDates: GetScheduleDatesHandler,
    private readonly _updateStageStatus: UpdateStageStatusHandler,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.rows = this.buildRows();
    void this.loadRowsFromServer();
  }

  get visibleRows(): StageEnableRow[] {
    if (this.selectedYear === null) {
      return [];
    }

    const selectedOption = this.yearOptions.find(
      (option) => option.year === this.selectedYear
    );

    if (!selectedOption) {
      return [];
    }

    return this.rows.slice(selectedOption.start, selectedOption.end);
  }

  goBack(): void {
    this.router.navigate(['/tracking-user']);
  }

  async saveRow(row: StageEnableRow): Promise<void> {
    this.savingStage = row.stage;

    try {
      const updateResult = await this._updateStageStatus.execute({
        ID_FASE: row.stage,
        ES_ACTIVO: row.enable ? 1 : 0,
      });
      //console.log('[TableEditFin] updateStageStatus result', updateResult);

      const updatedEntries: StageEnableEntry[] = this.rows.map((item) => ({
        stage: item.stage,
        enable: item.enable,
        start: item.start,
        end: item.end,
      }));
      this.persistEntries(updatedEntries);

      await this.loadRowsFromServer(false);

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La ${row.labelStage} se marcó como ${row.enable ? 'habilitada' : 'deshabilitada'}.`,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('No se pudo actualizar la fase', error);
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: 'Intenta nuevamente en unos minutos.',
      });
      await this.loadRowsFromServer(false);
    } finally {
      this.savingStage = null;
    }
  }

  private async loadRowsFromServer(withLoader = true): Promise<void> {
    if (withLoader) {
      this.loading = true;
    }
    try {
      const response = await this._getScheduleDates.execute();
      //console.log('[TableEditFin] getScheduleDates response', response);
      const storedEntries = this.readStageEnable();
      const entries = this.mapApiResponseToEntries(response, storedEntries);
      this.persistEntries(entries);
      this.rows = this.buildRows(entries);
    } catch (error) {
      console.error('No se pudo sincronizar el cronograma con el servidor', error);
      Swal.fire({
        icon: 'warning',
        title: 'Sincronización incompleta',
        text: 'No se pudo obtener el cronograma más reciente. Se muestran los valores almacenados localmente.',
      });
      this.rows = this.buildRows();
    } finally {
      if (withLoader) {
        this.loading = false;
      }
    }
  }

  private buildRows(entries?: StageEnableEntry[]): StageEnableRow[] {
    const stored = entries ?? this.readStageEnable();
    return ConfigSurvey.SCHEDULE_CONFIG_EDIT.map((stageConfig: any) => {
      const match = stored.find((entry) => entry.stage === stageConfig.stage);
      return {
        stage: stageConfig.stage,
        labelStage: stageConfig.labelStage,
        start: this.normalizeDate(match?.start ?? stageConfig.dateEnable),
        end: this.normalizeDate(match?.end ?? stageConfig.dateEnable),
        enable: match?.enable ?? false,
      };
    });
  }

  private readStageEnable(): StageEnableEntry[] {
    const raw = localStorage.getItem('dataStageEnable');
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private normalizeDate(value?: string | null): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private mapApiResponseToEntries(
    response: any[],
    currentEntries: StageEnableEntry[] = []
  ): StageEnableEntry[] {
    const safeResponse = Array.isArray(response) ? response : [];
    const enableMap = new Map(currentEntries.map((entry) => [entry.stage, entry.enable]));
    return ConfigSurvey.SCHEDULE_CONFIG_EDIT.map((stageConfig: any) => {
      const apiEntry = safeResponse.find(
        (item: any) => Number(item.ID_FASE) === Number(stageConfig.stage)
      );
      const start = this.normalizeDate(apiEntry?.FECHA_INICIO ?? stageConfig.dateEnable);
      const end = this.normalizeDate(apiEntry?.FECHA_FIN ?? stageConfig.dateEnable);
      const enableFromApi = this.normalizeApiEnable(apiEntry?.ES_ACTIVO);
      return {
        stage: stageConfig.stage,
        enable: enableFromApi ?? enableMap.get(stageConfig.stage) ?? false,
        start,
        end,
      };
    });
  }

  private normalizeApiEnable(value: any): boolean | null {
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
  }

  private persistEntries(entries: StageEnableEntry[]): void {
    localStorage.setItem('dataStageEnable', JSON.stringify(entries));
    this.syncStageStorage(entries);
  }

  private syncStageStorage(entries: StageEnableEntry[]): void {
    const rawStage = localStorage.getItem('stage');
    const parsedStage = rawStage
      ? JSON.parse(rawStage)
      : JSON.parse(JSON.stringify(ConfigSurvey.SCHEDULE_CONFIG_EDIT));

    const updated = parsedStage.map((stageItem: any) => {
      const stageNumber = Number(
        stageItem.stage ?? this.extractStageNumber(stageItem.labelStage)
      );
      const match = entries.find((entry) => entry.stage === stageNumber);
      if (match) {
        return {
          ...stageItem,
          stage: stageNumber,
          enable: match.enable,
          dateEnable: match.end,
        };
      }
      return {
        ...stageItem,
        stage: stageNumber,
      };
    });

    localStorage.setItem('stage', JSON.stringify(updated));
  }

  private extractStageNumber(label?: string): number | null {
    if (!label) {
      return null;
    }
    const match = label.match(/(\d+)/);
    return match ? Number(match[1]) : null;
  }
}

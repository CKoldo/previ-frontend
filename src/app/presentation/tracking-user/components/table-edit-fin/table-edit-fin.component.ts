import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { GetScheduleDatesHandler } from 'app/application/survey/get-schedule-dates/get-schedule-dates.handler';
import { UpdateScheduleDatesHandler } from 'app/application/survey/update-schedule-dates/update-schedule-dates.handler';
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

interface StageDateForm {
  start: string;
  end: string;
}

interface YearOption {
  year: number;
  start: number;
  end: number;
}

@Component({
  selector: 'app-table-edit-fin',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './table-edit-fin.component.html',
  styleUrl: './table-edit-fin.component.css',
  providers: [{ provide: ISurveyRepository, useClass: SurveyRepository }],
})
export class TableEditFinComponent implements OnInit {
  rows: StageEnableRow[] = [];
  savingStage: number | null = null;
  savingDateStage: number | null = null;
  loading = false;
  selectedYear: number | null = null;
  dateDialogVisible = false;
  selectedDateRow: StageEnableRow | null = null;
  dateForm: StageDateForm = {
    start: '',
    end: '',
  };
  readonly yearOptions: YearOption[] = [
    { year: 2025, start: 0, end: 5 },
    { year: 2026, start: 5, end: 10 },
  ];

  constructor(
    private readonly _getScheduleDates: GetScheduleDatesHandler,
    private readonly _updateScheduleDates: UpdateScheduleDatesHandler,
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

  get hasDateChanges(): boolean {
    const payload = this.getSelectedDatePayload();

    if (!payload) {
      return false;
    }

    return payload.row.start !== payload.start || payload.row.end !== payload.end;
  }

  get dateValidationMessage(): string | null {
    const payload = this.getSelectedDatePayload();

    if (!payload) {
      return null;
    }

    const { row, start, end } = payload;

    if (!start || !end) {
      return 'Debe seleccionar la fecha de inicio y la fecha de fin.';
    }

    if (start > end) {
      return 'La fecha de inicio no puede ser mayor que la fecha de fin.';
    }

    const nextRow = this.getNextRowInSameYear(row.stage);
    if (nextRow && end >= nextRow.start) {
      return `La fecha de fin debe ser menor que el inicio de la siguiente fase (${nextRow.labelStage}: ${nextRow.start}).`;
    }

    return null;
  }

  get canSaveDates(): boolean {
    return this.hasDateChanges && !this.dateValidationMessage;
  }

  goBack(): void {
    this.router.navigate(['/tracking-user']);
  }

  editRow(row: StageEnableRow): void {
    console.log('[TableEditFin] editRow dates', {
      start: row.start,
      end: row.end,
    });

    this.selectedDateRow = row;
    this.dateForm = {
      start: row.start,
      end: row.end,
    };
    this.dateDialogVisible = true;
  }

  closeDateDialog(): void {
    if (this.savingDateStage !== null) {
      return;
    }

    this.resetDateDialogState();
  }

  private forceCloseDateDialog(): void {
    this.resetDateDialogState();
  }

  private resetDateDialogState(): void {
    this.dateDialogVisible = false;
    this.selectedDateRow = null;
    this.dateForm = {
      start: '',
      end: '',
    };
  }

  async saveDates(): Promise<void> {
    if (!this.selectedDateRow) {
      return;
    }

    const row = this.selectedDateRow;
    const start = this.normalizeDate(this.dateForm.start);
    const end = this.normalizeDate(this.dateForm.end);
    const validationMessage = this.dateValidationMessage;

    if (!this.hasDateChanges) {
      return;
    }

    if (validationMessage) {
      await Swal.fire({
        icon: 'warning',
        title: 'Rango inválido',
        text: validationMessage,
      });
      return;
    }

    this.savingDateStage = row.stage;
    this.forceCloseDateDialog();

    Swal.fire({
      title: 'Guardando fechas...',
      text: 'Espere un momento.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await this._updateScheduleDates.execute({
        ID_FASE: row.stage,
        FECHA_INICIO: start,
        FECHA_FIN: end,
        ES_ACTIVO: row.enable ? 1 : 0,
      });

      const updatedEntries: StageEnableEntry[] = this.rows.map((item) => ({
        stage: item.stage,
        enable: item.enable,
        start: item.stage === row.stage ? start : item.start,
        end: item.stage === row.stage ? end : item.end,
      }));

      this.persistEntries(updatedEntries);
      this.rows = this.buildRows(updatedEntries);
      await this.loadRowsFromServer(false);
      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Fechas actualizadas',
        text: `El rango de ${row.labelStage} fue actualizado correctamente.`,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('No se pudo actualizar el rango de fechas', error);
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: 'Intenta nuevamente en unos minutos.',
      });
      await this.loadRowsFromServer(false);
    } finally {
      this.savingDateStage = null;
    }
  }

  async saveRow(row: StageEnableRow): Promise<void> {
    this.savingStage = row.stage;

    Swal.fire({
      title: 'Guardando estado...',
      text: 'Espere un momento.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

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
      Swal.close();

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La ${row.labelStage} se marcó como ${row.enable ? 'habilitada' : 'deshabilitada'}.`,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('No se pudo actualizar la fase', error);
      Swal.close();
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

    const normalizedValue = String(value).trim();
    const flatDateMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (flatDateMatch) {
      const [, year, month, day] = flatDateMatch;
      return `${year}-${month}-${day}`;
    }

    const date = new Date(normalizedValue);
    if (isNaN(date.getTime())) {
      return '';
    }

    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${date.getUTCFullYear()}-${month}-${day}`;
  }

  private getSelectedDatePayload(): {
    row: StageEnableRow;
    start: string;
    end: string;
  } | null {
    if (!this.selectedDateRow) {
      return null;
    }

    return {
      row: this.selectedDateRow,
      start: this.normalizeDate(this.dateForm.start),
      end: this.normalizeDate(this.dateForm.end),
    };
  }

  private getNextRowInSameYear(stage: number): StageEnableRow | null {
    const currentIndex = this.rows.findIndex((row) => row.stage === stage);

    if (currentIndex === -1) {
      return null;
    }

    const currentYearOption = this.yearOptions.find(
      (option) => currentIndex >= option.start && currentIndex < option.end
    );

    if (!currentYearOption || currentIndex + 1 >= currentYearOption.end) {
      return null;
    }

    return this.rows[currentIndex + 1] ?? null;
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

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import Swal from 'sweetalert2';

import { GetScheduleDatesHandler } from 'app/application/survey/get-schedule-dates/get-schedule-dates.handler';
import { UpdateScheduleDatesHandler } from 'app/application/survey/update-schedule-dates/update-schedule-dates.handler';
import { ScheduleDateEntry } from 'app/domain/survey/survey.model';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { SurveyRepository } from 'app/infrastructure/repositories/survey.repository';
import { ConfigSurvey } from 'app/shared/constants/configs';
import { Router } from '@angular/router';

interface StageEnableEntry {
  stage: number;
  enable: boolean;
  enable_validacion?: boolean;
  phase_enabled?: boolean;
  start?: string;
  end?: string;
  start_validacion?: string;
  end_validacion?: string;
}

interface StageEnableRow {
  stage: number;
  labelStage: string;
  start: string;
  end: string;
  start_validacion?: string;
  end_validacion?: string;
  enable: boolean;
  enable_validacion?: boolean;
  phase_enabled: boolean;
}

interface StageDateForm {
  start: string;
  end: string;
  start_validacion?: string;
  end_validacion?: string;
}

interface StageStatusMeta {
  label: string;
  detail: string;
  className: string;
}

interface StageStatusValidationMeta {
  label: string;
  detail: string;
  className: string;
}

interface YearOption {
  year: number;
  start: number;
  end: number;
}

@Component({
  selector: 'app-table-edit-fin',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ToggleSwitchModule],
  templateUrl: './table-edit-fin.component.html',
  styleUrl: './table-edit-fin.component.css',
  providers: [{ provide: ISurveyRepository, useClass: SurveyRepository }],
})
export class TableEditFinComponent implements OnInit {
  rows: StageEnableRow[] = [];
  savingDateStage: number | null = null;
  savingPhaseStage: number | null = null;
  loading = false;
  selectedYear: number | null = null;
  dateDialogVisible = false;
  selectedDateRow: StageEnableRow | null = null;
  dateForm: StageDateForm = {
    start: '',
    end: '',
    start_validacion: '',
    end_validacion: '',
  };
  readonly yearOptions: YearOption[] = [
    { year: 2025, start: 0, end: 5 },
    { year: 2026, start: 5, end: 10 },
  ];

  constructor(
    private readonly _getScheduleDates: GetScheduleDatesHandler,
    private readonly _updateScheduleDates: UpdateScheduleDatesHandler,
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

    return (
      payload.row.start !== payload.start ||
      payload.row.end !== payload.end ||
      (payload.row.start_validacion ?? '') !== payload.start_validacion ||
      (payload.row.end_validacion ?? '') !== payload.end_validacion
    );
  }

  get dateValidationMessage(): string | null {
    const payload = this.getSelectedDatePayload();

    if (!payload) {
      return null;
    }

    const { row, start, end, start_validacion, end_validacion } = payload;
    const yearOption = this.getYearOptionForStage(row.stage);

    if (!start || !end) {
      return 'Debe seleccionar la fecha de inicio y la fecha de fin de reporte.';
    }

    if (start > end) {
      return 'La fecha de inicio de reporte no puede ser mayor que la fecha de fin de reporte.';
    }

    if ((start_validacion && !end_validacion) || (!start_validacion && end_validacion)) {
      return 'Debe seleccionar la fecha de inicio y la fecha de fin de validación.';
    }

    if (start_validacion && end_validacion && start_validacion > end_validacion) {
      return 'La fecha de inicio de validación no puede ser mayor que la fecha de fin de validación.';
    }

    if (start_validacion && start_validacion <= end) {
      return 'La fecha de inicio de validación no puede ser menor o igual que la fecha de fin de reporte.';
    }

    if (start_validacion && end >= start_validacion) {
      return 'La fecha de fin de reporte no puede ser mayor o igual que la fecha de inicio de validación.';
    }

    const previousRow = this.getPreviousRowInSameYear(row.stage);
    const previousValidationEnd = previousRow?.end_validacion
      ? this.normalizeDate(previousRow.end_validacion)
      : '';

    if (previousValidationEnd && start <= previousValidationEnd) {
      return `La fecha de inicio de reporte no puede ser menor o igual que la fecha de fin de validación de la fase anterior (${previousRow?.labelStage}: ${previousValidationEnd}).`;
    }

    if (previousRow && start <= previousRow.end) {
      return `La fecha de inicio de reporte debe ser mayor que la fecha de fin de la fase anterior (${previousRow.labelStage}: ${previousRow.end}).`;
    }

    if (yearOption && this.isFirstStageOfYear(row.stage)) {
      const minStartDate = `${yearOption.year}-01-01`;
      if (start < minStartDate) {
        return `La fecha de inicio de reporte de ${row.labelStage} no puede ser menor que ${minStartDate}.`;
      }
    }

    const nextRow = this.getNextRowInSameYear(row.stage);
    if (nextRow && end >= nextRow.start) {
      return `La fecha de fin de reporte debe ser menor que el inicio de la siguiente fase (${nextRow.labelStage}: ${nextRow.start}).`;
    }

    if (nextRow && end_validacion && end_validacion >= nextRow.start) {
      return `La fecha de fin de validación no puede ser mayor o igual que la fecha de inicio de la siguiente fase (${nextRow.labelStage}: ${nextRow.start}).`;
    }

    if (yearOption && this.isLastStageOfYear(row.stage)) {
      const lastDayOfYear = `${yearOption.year}-12-31`;
      if (end > lastDayOfYear) {
        return `La fecha de fin de reporte de ${row.labelStage} no puede ser mayor que ${lastDayOfYear}.`;
      }

      if (end_validacion && end_validacion >= lastDayOfYear) {
        return `La fecha de fin de validación de ${row.labelStage} no puede ser mayor o igual que ${lastDayOfYear}.`;
      }
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
      start_validacion: row.start_validacion ?? '',
      end_validacion: row.end_validacion ?? '',
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
      start_validacion: '',
      end_validacion: '',
    };
  }

  async updatePhaseStatus(row: StageEnableRow, enabled: boolean): Promise<void> {
    const previousValue = row.phase_enabled;
    row.phase_enabled = enabled;
    this.savingPhaseStage = row.stage;

    Swal.fire({
      title: enabled ? 'Activando fase...' : 'Desactivando fase...',
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
        ES_ACTIVO_FASE: enabled,
      });

      await this.loadRowsFromServer(false);
      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: enabled ? 'Fase activada' : 'Fase desactivada',
        text: `La fase ${row.labelStage} fue ${enabled ? 'activada' : 'desactivada'} correctamente.`,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      row.phase_enabled = previousValue;
      console.error('No se pudo actualizar el estado global de la fase', error);
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: 'Intenta nuevamente en unos minutos.',
      });
      await this.loadRowsFromServer(false);
    } finally {
      this.savingPhaseStage = null;
    }
  }

  async saveDates(): Promise<void> {
    if (!this.selectedDateRow) {
      return;
    }

    const row = this.selectedDateRow;
    const start = this.normalizeDate(this.dateForm.start);
    const end = this.normalizeDate(this.dateForm.end);
    const startValidacion = this.normalizeDate(this.dateForm.start_validacion);
    const endValidacion = this.normalizeDate(this.dateForm.end_validacion);
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
        FECHA_INICIO_REPORTE: start,
        FECHA_FIN_REPORTE: end,
        FECHA_INICIO_VALIDACION: startValidacion || null,
        FECHA_FIN_VALIDACION: endValidacion || null,
      });

      const updatedEntries: StageEnableEntry[] = this.rows.map((item) => ({
        stage: item.stage,
        enable: item.enable,
        enable_validacion: item.enable_validacion,
        phase_enabled: item.phase_enabled,
        start: item.stage === row.stage ? start : item.start,
        end: item.stage === row.stage ? end : item.end,
        start_validacion:
          item.stage === row.stage ? startValidacion : item.start_validacion,
        end_validacion:
          item.stage === row.stage ? endValidacion : item.end_validacion,
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
        start_validacion: this.normalizeDate(match?.start_validacion),
        end_validacion: this.normalizeDate(match?.end_validacion),
        enable: match?.enable ?? false,
        enable_validacion: match?.enable_validacion ?? false,
        phase_enabled: match?.phase_enabled ?? true,
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
    start_validacion: string;
    end_validacion: string;
  } | null {
    if (!this.selectedDateRow) {
      return null;
    }

    return {
      row: this.selectedDateRow,
      start: this.normalizeDate(this.dateForm.start),
      end: this.normalizeDate(this.dateForm.end),
      start_validacion: this.normalizeDate(this.dateForm.start_validacion),
      end_validacion: this.normalizeDate(this.dateForm.end_validacion),
    };
  }

  private getNextRowInSameYear(stage: number): StageEnableRow | null {
    const currentIndex = this.rows.findIndex((row) => row.stage === stage);

    if (currentIndex === -1) {
      return null;
    }

    const currentYearOption = this.getYearOptionForStage(stage);

    if (!currentYearOption || currentIndex + 1 >= currentYearOption.end) {
      return null;
    }

    return this.rows[currentIndex + 1] ?? null;
  }

  private getPreviousRowInSameYear(stage: number): StageEnableRow | null {
    const currentIndex = this.rows.findIndex((row) => row.stage === stage);

    if (currentIndex === -1) {
      return null;
    }

    const currentYearOption = this.getYearOptionForStage(stage);

    if (!currentYearOption || currentIndex - 1 < currentYearOption.start) {
      return null;
    }

    return this.rows[currentIndex - 1] ?? null;
  }

  private getYearOptionForStage(stage: number): YearOption | null {
    const currentIndex = this.rows.findIndex((row) => row.stage === stage);

    if (currentIndex === -1) {
      return null;
    }

    return (
      this.yearOptions.find(
        (option) => currentIndex >= option.start && currentIndex < option.end
      ) ?? null
    );
  }

  private isFirstStageOfYear(stage: number): boolean {
    const yearOption = this.getYearOptionForStage(stage);

    if (!yearOption) {
      return false;
    }

    return this.rows[yearOption.start]?.stage === stage;
  }

  private isLastStageOfYear(stage: number): boolean {
    const yearOption = this.getYearOptionForStage(stage);

    if (!yearOption) {
      return false;
    }

    return this.rows[yearOption.end - 1]?.stage === stage;
  }

  private mapApiResponseToEntries(
    response: ScheduleDateEntry[],
    currentEntries: StageEnableEntry[] = []
  ): StageEnableEntry[] {
    const safeResponse = Array.isArray(response) ? response : [];
    const enableMap = new Map(currentEntries.map((entry) => [entry.stage, entry.enable]));
    return ConfigSurvey.SCHEDULE_CONFIG_EDIT.map((stageConfig: any) => {
      const apiEntry = safeResponse.find(
        (item) => Number(item.ID_FASE) === Number(stageConfig.stage)
      );
      const start = this.normalizeDate(
        apiEntry?.FECHA_INICIO_REPORTE ?? stageConfig.dateEnable
      );
      const end = this.normalizeDate(
        apiEntry?.FECHA_FIN_REPORTE ?? stageConfig.dateEnable
      );
      const start_validacion = this.normalizeDate(
        apiEntry?.FECHA_INICIO_VALIDACION
      );
      const end_validacion = this.normalizeDate(
        apiEntry?.FECHA_FIN_VALIDACION
      );
      const enableFromApi = this.normalizeApiEnable(apiEntry?.ES_ACTIVO_REPORTE);
      const validationEnableFromApi = this.normalizeApiEnable(
        apiEntry?.ES_ACTIVO_VALIDACION
      );
      const phaseEnableFromApi = this.normalizeApiEnable(apiEntry?.ES_ACTIVO_FASE);
      const currentEntry = currentEntries.find(
        (entry) => entry.stage === stageConfig.stage
      );
      return {
        stage: stageConfig.stage,
        enable: enableFromApi ?? enableMap.get(stageConfig.stage) ?? false,
        enable_validacion:
          validationEnableFromApi ?? currentEntry?.enable_validacion ?? false,
        phase_enabled: phaseEnableFromApi ?? currentEntry?.phase_enabled ?? true,
        start,
        end,
        start_validacion,
        end_validacion,
      };
    });
  }

  hasValidationRange(row: StageEnableRow): boolean {
    return Boolean(row.start_validacion || row.end_validacion);
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
          phase_enabled: match.phase_enabled,
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

  getStageStatusMeta(row: StageEnableRow): StageStatusMeta {
    const today = this.getTodayAsDateOnly();

    if (!row.start || !row.end) {
      return {
        label: 'Sin rango',
        detail: 'Configure la fecha de inicio y fin.',
        className: 'is-pending',
      };
    }

    if (row.enable) {
      return {
        label: 'Activa',
        detail: 'Disponible en la fecha actual.',
        className: 'is-active',
      };
    }

    if (!row.phase_enabled) {
      return {
        label: 'Bloqueada',
        detail: 'La fase está desactivada globalmente.',
        className: 'is-blocked',
      };
    }

    if (today < row.start) {
      return {
        label: 'Programada',
        detail: `Inicia el ${this.formatDisplayDate(row.start)}.`,
        className: 'is-scheduled',
      };
    }

    if (today > row.end) {
      return {
        label: 'Finalizada',
        detail: `Finalizó el ${this.formatDisplayDate(row.end)}.`,
        className: 'is-inactive',
      };
    }

    return {
      label: 'No disponible',
      detail: 'Revise la configuración del rango en el backend.',
      className: 'is-pending',
    };
  }

  getStageStatusValidationMeta(row: StageEnableRow): StageStatusValidationMeta {
    const today = this.getTodayAsDateOnly();

    if (!row.start_validacion || !row.end_validacion) {
      return {
        label: 'Sin rango',
        detail: 'Configure la fecha de inicio y fin.',
        className: 'is-pending',
      };
    }

    if (row.enable_validacion) {
      return {
        label: 'Activa',
        detail: 'Disponible en la fecha actual.',
        className: 'is-active',
      };
    }

    if (!row.phase_enabled) {
      return {
        label: 'Bloqueada',
        detail: 'La fase está desactivada globalmente.',
        className: 'is-blocked',
      };
    }

    if (today < row.start_validacion) {
      return {
        label: 'Programada',
        detail: `Inicia el ${this.formatDisplayDate(row.start_validacion)}.`,
        className: 'is-scheduled',
      };
    }

    if (today > row.end_validacion) {
      return {
        label: 'Finalizada',
        detail: `Finalizó el ${this.formatDisplayDate(row.end_validacion)}.`,
        className: 'is-inactive',
      };
    }

    return {
      label: 'No disponible',
      detail: 'Revise la configuración del rango en el backend.',
      className: 'is-pending',
    };
  }

  formatDisplayDate(value?: string): string {
    if (!value) {
      return '--/--/----';
    }

    const normalized = this.normalizeDate(value);
    if (!normalized) {
      return '--/--/----';
    }

    const [year, month, day] = normalized.split('-');
    return `${day}/${month}/${year}`;
  }

  private extractStageNumber(label?: string): number | null {
    if (!label) {
      return null;
    }
    const match = label.match(/(\d+)/);
    return match ? Number(match[1]) : null;
  }

  private getTodayAsDateOnly(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }
}

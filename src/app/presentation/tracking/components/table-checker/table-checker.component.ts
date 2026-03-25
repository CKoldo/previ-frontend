import { ConfigSurvey } from './../../../../shared/constants/configs';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ListboxModule } from 'primeng/listbox';
import { Router } from '@angular/router';
import { GetPhaseFilesHandler } from 'app/application/tracking-user/get-phase-files/get-phase-files.handler';
import { GetPhaseFilesQuery } from 'app/application/tracking-user/get-phase-files/get-phase-files.query';
import { GetScheduleDatesHandler } from 'app/application/survey/get-schedule-dates/get-schedule-dates.handler';
import { GetScheduleDatesQuery } from 'app/application/survey/get-schedule-dates/get-schedule-dates.query';
import { ScheduleDateEntry } from 'app/domain/survey/survey.model';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { ITrackingUserRepository } from 'app/domain/tracking-user/tracking-user.repository';
import { SurveyRepository } from 'app/infrastructure/repositories/survey.repository';
import { TrackingUserRepository } from 'app/infrastructure/repositories/tracking-user.repository';
import Swal from 'sweetalert2';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ScheduleYear } from 'app/shared/utils/stage-storage.util';

@Component({
  selector: 'app-table-checker',
  imports: [
    CommonModule,
    CheckboxModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    ListboxModule
  ],
  providers: [
    { provide: ISurveyRepository, useClass: SurveyRepository },
    { provide: GetScheduleDatesQuery, useClass: GetScheduleDatesHandler },
    { provide: ITrackingUserRepository, useClass: TrackingUserRepository },
    { provide: GetPhaseFilesQuery, useClass: GetPhaseFilesHandler },
  ],
  templateUrl: './table-checker.component.html',
  styleUrl: './table-checker.component.css',
})
export class TableCheckerComponent implements OnInit, OnChanges {
  @Input() scheduleYear: ScheduleYear = '2025';
  @Input() refreshToken: number = 0;
  @Input() searchTerm: string = '';
  arrayTabla: any[] = [];
  phaseHeaders: any[] = [];
  listaIEs: any = [];
  esUGEL: boolean = false;
  esDRE: boolean = false;
  phaseDialog: boolean = false;
  stagesWithPhases: { stage: number; phases: number[]; displayStage: number }[] = [];
  selectedPhasesByStage: { [stage: number]: number[] } = {};
  arrayArchivos: any[] = [];
  validationEnabledStages = new Set<number>();

  selectIE: any = null;

  constructor(
    private _getScheduleDatesQuery: GetScheduleDatesQuery,
    private _getPhaseFilesQuery: GetPhaseFilesQuery,
    private _router: Router,
  ) {
    const dataUser: any = localStorage.getItem('dataUser')
      ? JSON.parse(localStorage.getItem('dataUser') as string)
      : null;
    if (dataUser) {
      this.esUGEL = dataUser?.TIPO_INSTITUCION == 2;
      this.esDRE = dataUser?.TIPO_INSTITUCION == 3;
    }
  }

  ngOnInit() {
    this.buildStructureTable();
    this.phaseHeaders = this.getPhaseHeaders();
    this.syncTableData();
    void this.loadValidationAvailability();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scheduleYear'] && !changes['scheduleYear'].firstChange) {
      this.buildStructureTable();
      this.phaseHeaders = this.getPhaseHeaders();
      this.syncTableData();
      void this.loadValidationAvailability();
      return;
    }

    if (changes['refreshToken'] && !changes['refreshToken'].firstChange) {
      this.syncTableData();
      void this.loadValidationAvailability();
      return;
    }

    if (changes['searchTerm'] && !changes['searchTerm'].firstChange) {
      this.syncTableData();
    }
  }

  get emptyTableMessage(): string {
    if (this.searchTerm?.trim()) {
      return 'No se encontraron instituciones con ese criterio de búsqueda.';
    }

    return `Sin registros para el año ${this.scheduleYear}.`;
  }

  buildStructureTable() {
    const scheduleConfig = this.getScheduleConfigForYear();
    this.arrayTabla = scheduleConfig.map((item: any) => ({
      idStage: item.stage,
      label: item.labelStage,
      phase: item.survey.map((survey: any) => ({
        idStage: item.stage,
        idPhase: this.composePhaseId(item.stage, survey.survey),
        label: survey.label,
      })),
    }));
  }

  buildListBoxStages(fasesTareas: any[] = []) {
    // Agrupa phases por stage usando STAGE_PHASE_CONFIG
    const grouped: { [stage: number]: number[] } = {};
    const { min, max } = this.getStageRange();
    for (const item of ConfigSurvey.STAGE_PHASE_CONFIG) {
      if (item.stage < min || item.stage > max) {
        continue;
      }
      if (!grouped[item.stage]) grouped[item.stage] = [];
      if (!grouped[item.stage].includes(item.phase))
        grouped[item.stage].push(item.phase);
    }
    const rawStages = Object.entries(grouped).map(([stage, phases]) => {
      const numericStage = Number(stage);
      return {
        stage: numericStage,
        displayStage: this.getDisplayStageNumber(numericStage),
        phases: phases as number[],
      };
    });

    this.stagesWithPhases = rawStages
      .map((s) => ({
        ...s,
        phases: s.phases.filter((p) =>
          fasesTareas.some((ft) => ft.stage === s.stage && ft.phase === p),
        ),
      }))
      .filter((s) => s.phases.length > 0);

    // Inicializa selectedPhasesByStage solo con los stages disponibles
    this.selectedPhasesByStage = {};
    for (const s of this.stagesWithPhases) {
      this.selectedPhasesByStage[s.stage] = [];
    }
  }

  getTableData() {
    const data = localStorage.getItem('dataTracking');
    const payload = this.parseTrackingPayload(data);
    const yearEntries = payload[this.scheduleYear] ?? [];
    const normalizedSearch = this.normalizeSearchTerm(this.searchTerm);

    this.listaIEs = yearEntries
      .map((ie: any) => ({
        ...ie,
        trackingYear: this.resolveEntryYear(ie),
        checks: this.extractCheckedPhases(ie),
      }))
      .filter((ie: any) => this.matchesInstitutionFilter(ie, normalizedSearch));
  }

  extractCheckedPhases(data: any): any[] {
    return Object.keys(data)
      .filter((key) => key.toUpperCase().startsWith('FASE'))
      .map((key) => ({
        idPhase: this.buildPhaseIdentifier(key),
        value: data[key],
      }));
  }

  private buildPhaseIdentifier(rawKey: string): string {
    const [faseSegment = '', tareaSegment = ''] = rawKey.split('_');
    const phaseNumber = Number(faseSegment.replace('FASE', ''));
    const taskNumber = tareaSegment.replace('TAREA', '');
    const validPhase = Number.isFinite(phaseNumber) ? phaseNumber : 0;
    return `${validPhase}-${taskNumber}`;
  }

  getTaskStatusClass(tarea: any): string {
    if (tarea?.enable == false) {
      return 'bg-gray-100 text-gray-800';
    }
    if (tarea?.complete === true) {
      return 'bg-green-100 text-green-800';
    } else if (tarea?.complete === false) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }

  getTaskStatusIcon(tarea: any): string {
    if (tarea?.enable == false) {
      return 'pi pi-exclamation-circle';
    }
    if (tarea?.complete === true) {
      return 'pi pi-check-circle';
    } else if (tarea?.complete === false) {
      return 'pi pi-list-check';
    } else {
      return 'pi pi-circle-exclamation';
    }
  }

  getTaskStatusText(tarea: any): string {
    if (tarea?.enable == false) {
      return 'No disponible';
    }
    if (tarea?.complete === true) {
      return 'Completada';
    } else if (tarea?.complete === false) {
      return 'Esperando';
    } else {
      return 'No disponible';
    }
  }

  getPhaseHeaders() {
    return (
      this.arrayTabla?.flatMap((stage) =>
        stage.phase.map((phase: any): any => ({ ...phase })),
      ) || []
    );
  }

  getChecks(ie: any, phase: any) {
    if (!Array.isArray(ie?.checks)) {
      return false;
    }

    return ie.checks.some(
      (item: any) => item.idPhase === phase.idPhase && item.value == 1,
    );
  }

  canEditTask(phase: any): boolean {
    return this.validationEnabledStages.has(Number(phase?.idStage));
  }

  getEditTaskTitle(phase: any): string {
    if (this.canEditTask(phase)) {
      return 'Editar tarea';
    }

    return 'La edición solo está disponible durante la validación.';
  }

  editTaskFromCell(ie: any, phase: any): void {
    const stage = Number(phase?.idStage);
    const task = this.resolvePhaseTaskNumber(phase);

    if (!Number.isFinite(stage) || !Number.isFinite(task)) {
      Swal.fire({
        icon: 'warning',
        title: 'No se pudo editar',
        text: 'La tarea seleccionada no tiene una configuración válida.',
      });
      return;
    }

    this.openTaskEditor(ie, stage, task);
  }

  async showPhaseDialog(ie: any) {
    this.arrayArchivos = [];
    this.selectIE = ie;
    this.selectedPhasesByStage = {};

    Swal.fire({
      title: 'Cargando...',
      text: 'Por favor, espera mientras obtenemos los archivos para descargar.',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let codLocal = ie?.CODIGO_LOCAL ?? '';
      let data = await this._getPhaseFilesQuery.execute(codLocal);
      //console.log(data);
      if (data?.result && data?.result.length > 0) {
        this.arrayArchivos = data.result;
        // Filtra stagesWithPhases para mostrar solo los stages y phases que están presentes en arrayArchivos
        const fasesTareas = this.arrayArchivos.map((a: any) => ({
          stage: a.FASE,
          phase: a.TAREA,
        }));
        
        this.buildListBoxStages(fasesTareas);
        //console.log('Stages con phases disponibles:', fasesTareas);

      }
      //console.log('Archivos obtenidos:', this.arrayArchivos);


      // 4. Close the loading dialog
      Swal.close();

      // Optionally, show a success message after loading
      this.phaseDialog = true;
    } catch (error) {
      console.error('Error:', error);
      // 4. Close the loading dialog in case of an error
      Swal.close();

      // Optionally, show an error message
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load data.',
      });
    }
  }

  async downloadFiles() {
    // Recorre selectedPhasesByStage para obtener los stage y phases seleccionados
    const zip = new JSZip();
    let filesAdded = 0;
    for (const stageStr in this.selectedPhasesByStage) {
      const stage = Number(stageStr);
      const phases: number[] = this.selectedPhasesByStage[stage];
      for (const phase of phases) {
        // Busca el archivo correspondiente en arrayArchivos
        const archivo = this.arrayArchivos.find(
          (a: any) => a.FASE === stage && a.TAREA === phase,
        );
        if (!archivo) continue;
        // Acta
        if (archivo.ARCHIVO_ACTA && archivo.EXTENSION_ACTA) {
          const actaBlob = this.base64ToBlob(
            archivo.ARCHIVO_ACTA,
            archivo.EXTENSION_ACTA,
          );
          zip.file(
            `fase_${stage}_tarea_${phase}_acta.${archivo.EXTENSION_ACTA}`,
            actaBlob,
          );
          filesAdded++;
        }
        // Evidencia
        if (archivo.ARCHIVO_EVIDENCIA && archivo.EXTENSION_EVIDENCIA) {
          const evidenciaBlob = this.base64ToBlob(
            archivo.ARCHIVO_EVIDENCIA,
            archivo.EXTENSION_EVIDENCIA,
          );
          zip.file(
            `fase_${stage}_tarea_${phase}_evidencia.${archivo.EXTENSION_EVIDENCIA}`,
            evidenciaBlob,
          );
          filesAdded++;
        }
      }
    }
    if (filesAdded === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin archivos',
        text: 'No hay archivos para descargar.',
      });
      return;
    }

    let nameIe = this.selectIE?.NOMBRE_IE
      ? this.selectIE.NOMBRE_IE.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)
      : 'institucionseleccionada';

    let nameZip = this.selectIE?.CODIGO_LOCAL
      ? `archivos_${this.selectIE.CODIGO_LOCAL}_${nameIe}.zip`
      : 'archivos_seleccionados.zip';
    // Genera y descarga el zip
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, nameZip);
    });
  }

  base64ToBlob(base64: string, extension: string): Blob {
    let mimeType = '';
    let base64Data = base64;
    // Si viene con prefijo data:...
    if (base64.startsWith('data:')) {
      const matches = base64.match(/^data:([\w\-\/+]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType || undefined });
  }

  verifyPhaseSelected(): boolean {
    // Retorna true si hay al menos un phase seleccionado en cualquier stage
    return this.collectSelectedPhases().length > 0;
  }

  private collectSelectedPhases(): { stage: number; phase: number }[] {
    const result: { stage: number; phase: number }[] = [];
    Object.keys(this.selectedPhasesByStage || {}).forEach((stageKey) => {
      const stage = Number(stageKey);
      const phases = this.selectedPhasesByStage[stage] || [];
      phases.forEach((phase) => {
        result.push({ stage, phase: Number(phase) });
      });
    });
    return result;
  }

  private openTaskEditor(
    ie: any,
    stage: number,
    phase: number,
    taskInfo: any = null,
  ): void {
    const normalizedStage = this.normalizeStageForEdit(stage);

    const context: any = {
      ie,
      stage: normalizedStage.stage,
      phase,
      taskInfo,
      year: this.scheduleYear,
    };

    if (normalizedStage.originalStage !== undefined) {
      context.originalStage = normalizedStage.originalStage;
    }

    sessionStorage.setItem('trackingTaskToEdit', JSON.stringify(context));
    //console.log('Contexto guardado para edición:', context);
    this.phaseDialog = false;
    this._router.navigate(['/tracking', 'survey-edit']);
  }

  private resolvePhaseTaskNumber(phase: any): number {
    const phaseId = String(phase?.idPhase ?? '');
    const segments = phaseId.split('-');
    const suffix = segments.length > 1 ? segments[segments.length - 1] : '';
    const parsed = Number(suffix);

    if (Number.isFinite(parsed)) {
      return parsed;
    }

    const label = String(phase?.label ?? '');
    const match = label.match(/(\d+)/);
    return match ? Number(match[1]) : NaN;
  }

  private normalizeStageForEdit(stage: number): { stage: number; originalStage?: number } {
    if (this.scheduleYear === '2026' && Number.isFinite(stage) && stage > 5) {
      return {
        stage: stage - 5,
        originalStage: stage,
      };
    }
    return { stage };
  }

  private getScheduleConfigForYear(): any[] {
    const baseConfig = ConfigSurvey.SCHEDULE_CONFIG.filter(
      (item: any) => item.enable === true,
    );
    if (this.scheduleYear === '2026') {
      /* Para el año 2026, transformamos la configuración base sumando un offset a los stages*/
      return baseConfig.map((item: any) => this.transformStageForYear(item,5));
    }
    return baseConfig;
  }

  private transformStageForYear(item: any, offset: number): any {
    const newStage = item.stage + offset;
    return {
      ...item,
      stage: newStage,
      labelStage: item.labelStage ?? `Fase ${item.stage}`,
      survey: item.survey.map((survey: any) => ({
        ...survey,
        survey: this.composePhaseId(newStage, survey.survey),
      })),
    };
  }

  private composePhaseId(stage: number, surveyCode: string): string {
    const suffix = this.extractSurveySuffix(surveyCode);
    return suffix ? `${stage}-${suffix}` : `${stage}-1`;
  }

  private extractSurveySuffix(code: string): string {
    if (!code) {
      return '';
    }
    const parts = String(code).split('-');
    return parts.length > 1 ? parts[1] : parts[0];
  }

  private getStageRange(): { min: number; max: number } {
    if (this.scheduleYear === '2026') {
      return { min: 6, max: 10 };
    }
    return { min: 1, max: 5 };
  }

  private getDisplayStageNumber(stage: number): number {
    if (this.scheduleYear === '2026' && stage > 5) {
      return stage - 5;
    }
    return stage;
  }

  private syncTableData() {
    this.phaseDialog = false;
    this.selectIE = null;
    this.selectedPhasesByStage = {};
    this.getTableData();
  }

  private parseTrackingPayload(
    raw: string | null,
  ): Record<ScheduleYear, any[]> {
    const empty: Record<ScheduleYear, any[]> = {
      '2025': [],
      '2026': [],
    };

    if (!raw) {
      return empty;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return { ...empty, '2025': parsed };
      }

      if (parsed && typeof parsed === 'object') {
        const normalized = { ...empty };
        (['2025', '2026'] as ScheduleYear[]).forEach((year) => {
          const bucket = (parsed as Record<string, any>)[year];
          if (Array.isArray(bucket)) {
            normalized[year] = bucket;
          }
        });
        return normalized;
      }
    } catch (error) {
      console.warn('No se pudo analizar la data de tracking por año', error);
    }

    return empty;
  }

  private resolveEntryYear(entry: any): ScheduleYear {
    const value = entry?.YEAR ?? entry?.year ?? entry?.ANIO ?? entry?.anio;
    if (value && String(value).trim() === '2026') {
      return '2026';
    }
    return this.scheduleYear ?? '2025';
  }

  private matchesInstitutionFilter(ie: any, normalizedSearch: string): boolean {
    if (!normalizedSearch) {
      return true;
    }

    const institutionText = this.normalizeSearchTerm(
      `${ie?.CODIGO_LOCAL ?? ''} ${ie?.NOMBRE_IE ?? ''}`,
    );

    return institutionText.includes(normalizedSearch);
  }

  private normalizeSearchTerm(value: string | null | undefined): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private async loadValidationAvailability(): Promise<void> {
    try {
      const scheduleDates = await this._getScheduleDatesQuery.execute();
      const enabledStages = scheduleDates
        .filter((entry) => this.matchesScheduleYear(entry))
        .filter((entry) => this.isFlagEnabled(entry?.ES_ACTIVO_VALIDACION))
        .map((entry) => Number(entry.ID_FASE))
        .filter((stage) => Number.isFinite(stage));

      this.validationEnabledStages = new Set<number>(enabledStages);
    } catch (error) {
      console.warn(
        'No se pudo obtener la disponibilidad de validación para editar tareas.',
        error,
      );
      this.validationEnabledStages = new Set<number>();
    }
  }

  private matchesScheduleYear(entry: ScheduleDateEntry): boolean {
    const entryYear = String(entry?.YEAR ?? '').trim();

    if (!entryYear) {
      return true;
    }

    return entryYear === this.scheduleYear;
  }

  private isFlagEnabled(value: boolean | number | string | null | undefined): boolean {
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

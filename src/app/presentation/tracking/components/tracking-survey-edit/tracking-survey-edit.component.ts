import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Type } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InformationImplementationComponent } from 'app/presentation/survey/home/information-implementation/information-implementation.component';
import { Stage1Component as Stage1Component2025 } from 'app/presentation/survey/home/stage/stage-1/stage-1.component';
import { Stage2Component as Stage2Component2025 } from 'app/presentation/survey/home/stage/stage-2/stage-2.component';
import { Stage3Component as Stage3Component2025 } from 'app/presentation/survey/home/stage/stage-3/stage-3.component';
import { Stage4Component as Stage4Component2025 } from 'app/presentation/survey/home/stage/stage-4/stage-4.component';
import { Stage5Component as Stage5Component2025 } from 'app/presentation/survey/home/stage/stage-5/stage-5.component';
import { Stage1Component as Stage1Component2026 } from 'app/presentation/survey/home/stage-2026/stage-1/stage-1.component';
import { Stage2Component as Stage2Component2026 } from 'app/presentation/survey/home/stage-2026/stage-2/stage-2.component';
import { Stage3Component as Stage3Component2026 } from 'app/presentation/survey/home/stage-2026/stage-3/stage-3.component';
import { Stage4Component as Stage4Component2026 } from 'app/presentation/survey/home/stage-2026/stage-4/stage-4.component';
import { Stage5Component as Stage5Component2026 } from 'app/presentation/survey/home/stage-2026/stage-5/stage-5.component';
import { ConfigSurvey } from 'app/shared/constants/configs';
import { TemporalSaveService } from 'app/shared/services/temporal-save.service';
import { disableSurveyEditMode, enableSurveyEditMode } from 'app/shared/utils/survey-mode';
import { ScheduleYear } from 'app/shared/utils/stage-storage.util';

interface TrackingTaskEditContext {
  ie: any;
  stage: number;
  phase: number;
  taskInfo?: any;
  originalStage?: number;
  year?: ScheduleYear;
}

@Component({
  selector: 'app-tracking-survey-edit',
  standalone: true,
  imports: [
    CommonModule,
    InformationImplementationComponent,
    Stage1Component2025,
    Stage2Component2025,
    Stage3Component2025,
    Stage4Component2025,
    Stage5Component2025,
    Stage1Component2026,
    Stage2Component2026,
    Stage3Component2026,
    Stage4Component2026,
    Stage5Component2026,
  ],
  templateUrl: './tracking-survey-edit.component.html',
  styleUrl: './tracking-survey-edit.component.css',
})
export class TrackingSurveyEditComponent implements OnInit, OnDestroy {
  taskContext: TrackingTaskEditContext | null = null;
  selectedStage: number | null = null;
  selectedPhase: number | null = null;
  showSurvey = false;
  childLoading = false;
  isPreparing = false;
  errorMessage = '';
  private contextScheduleYear: ScheduleYear = '2025';

  private readonly stageComponentMap: Record<ScheduleYear, Record<number, Type<any>>> = {
    '2025': {
      1: Stage1Component2025,
      2: Stage2Component2025,
      3: Stage3Component2025,
      4: Stage4Component2025,
      5: Stage5Component2025,
    },
    '2026': {
      1: Stage1Component2026,
      2: Stage2Component2026,
      3: Stage3Component2026,
      4: Stage4Component2026,
      5: Stage5Component2026,
    },
  };

  readonly stageOutputs = {
    isLoading: (value: boolean) => this.handleChildLoading(value),
  };

  private readonly storageKeys = [
    'dataUser',
    'stage',
    'currentSurvey',
    'dataInformationImplementation',
  ];
  private storageSnapshot = new Map<string, string | null>();

  constructor(
    private router: Router,
    private temporalSaveService: TemporalSaveService,
    private cdr: ChangeDetectorRef
  ) {
    this.temporalSaveService.init(ConfigSurvey.STAGE_PHASE_CONFIG);
    this.backupStorage();
  }

  ngOnInit(): void {
    //console.log('Inicializando componente de edición de encuesta de seguimiento');
    this.loadTaskContext();
  }

  ngOnDestroy(): void {
    this.restoreStorage();
    disableSurveyEditMode();
  }

  get hasContext(): boolean {
    return !!this.taskContext;
  }

  get taskLabel(): string {
    if (!this.taskContext) {
      return '';
    }
    const originalStage = this.taskContext.originalStage;
    const stageLabel =
      originalStage && originalStage !== this.taskContext.stage
        //? `Fase ${this.taskContext.stage} (FASE ${originalStage})`
        ? `Fase ${this.taskContext.stage}`
        : `Fase ${this.taskContext.stage}`;
    return `${stageLabel} · Tarea ${this.taskContext.phase}`;
  }

  get institutionName(): string {
    return this.taskContext?.ie?.NOMBRE_IE || 'Institución educativa';
  }

  get stageInputs() {
    return {
      question: 1,
      phase: this.selectedPhase ?? 1,
      isAllStagesCompleted: false,
    };
  }

  get stageComponentToRender(): Type<any> | null {
    if (!this.selectedStage) {
      return null;
    }
    const year = this.contextScheduleYear ?? '2025';
    return this.stageComponentMap[year]?.[this.selectedStage] ?? null;
  }

  handleChildLoading(isLoading: boolean): void {
    this.childLoading = isLoading;
    this.cdr.markForCheck();
  }

  retryPreparation(): void {
    if (!this.taskContext) {
      this.loadTaskContext();
      return;
    }
    this.applySurveyContext(this.taskContext);
  }

  goBack(): void {
    this.router.navigate(['/tracking']);
  }

  private loadTaskContext(): void {
    const cached = sessionStorage.getItem('trackingTaskToEdit');
    if (!cached) {
      this.showMissingContextAlert();
      return;
    }
    //console.log('Cargando contexto de tarea para edición:', cached);
    try {
      const parsed = JSON.parse(cached);
      parsed.stage = Number(parsed.stage);
      parsed.phase = Number(parsed.phase);
      if (parsed.originalStage !== undefined) {
        parsed.originalStage = Number(parsed.originalStage);
      }
      this.taskContext = parsed;
      this.applySurveyContext(parsed);
    } catch (error) {
      console.error('Error al leer la tarea seleccionada', error);
      this.showMissingContextAlert();
    }
  }
  
  private applySurveyContext(context: TrackingTaskEditContext): void {
    //console.log('Aplicando contexto de encuesta:', context);
    const codigoLocal = context?.ie?.CODIGO_LOCAL?.toString().trim();
    const numeroDocumento = this.resolveNumeroDocumento(context?.ie);

    if (!codigoLocal || !numeroDocumento) {
      this.errorMessage =
        'No se pudo preparar el contexto porque faltan el código local o el número de documento.';
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: this.errorMessage,
      }).then(() => this.goBack());
      return;
    }

    this.isPreparing = true;
    this.errorMessage = '';
    this.showSurvey = false;
    this.childLoading = true;
    this.cdr.markForCheck();

    try {
      this.persistContext(numeroDocumento, codigoLocal, context.ie);
      this.setStageConfig();
      this.setCurrentSurvey(context.stage, context.phase);
      enableSurveyEditMode();

      this.contextScheduleYear = this.determineContextYear(context);

      this.selectedStage = context.stage;
      this.selectedPhase = context.phase;
      this.showSurvey = true;
      this.childLoading = false;
    } catch (error) {
      console.error('No se pudo preparar la fase seleccionada', error);
      this.errorMessage =
        'Ocurrió un problema al cargar la fase seleccionada. Intenta nuevamente.';
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: this.errorMessage,
      });
    } finally {
      this.isPreparing = false;
      this.cdr.markForCheck();
    }
  }

  private persistContext(
    numeroDocumento: string,
    codigoLocal: string,
    ieData: any
  ): void {
    const payload = {
      NUMERO_DOCUMENTO: numeroDocumento,
      //NUMERO_DOCUMENTO_IE:  ieData?.NUMERO_DOCUMENTO_IE ?? numeroDocumento,
      CODIGO_LOCAL: codigoLocal,
      REGISTRADO: true,
      NOMBRE_IE: ieData?.NOMBRE_IE,
      DRE: ieData?.DRE,
      UGEL: ieData?.UGEL,
    };
    localStorage.setItem('dataUser', JSON.stringify(payload));
    localStorage.removeItem('dataInformationImplementation');
    localStorage.removeItem('currentSurvey');
    this.temporalSaveService.emitChangeStatusTarea(true);
  }

  private setStageConfig(): void {
    localStorage.setItem('stage', JSON.stringify(ConfigSurvey.SCHEDULE_CONFIG));
  }

  private setCurrentSurvey(stage: number, task: number): void {
    const found = ConfigSurvey.STAGE_PHASE_CONFIG.find(
      (item: { stage: number; phase: number; questions: unknown }) =>
        item.stage === stage && item.phase === task
    );

    if (!found) {
      throw new Error('No existe configuración para la fase seleccionada.');
    }

    this.temporalSaveService.saveCurrentQuestionTemp(found.questions);
  }

  private resolveNumeroDocumento(ie: any): string | null {
    const candidates = [
      ie?.NUMERO_DOCUMENTO_IE,
      ie?.NUMERO_DOCUMENTO,
      ie?.NUM_DOC,
      ie?.DOCUMENTO,
      ie?.DNI_DIRECTOR,
      ie?.DNI,
    ];

    const value = candidates.find((item) => !!item);
    return value ? String(value).trim() : null;
  }

  private showMissingContextAlert(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Sin selección',
      text: 'Selecciona una tarea desde el listado para editarla.',
    }).then(() => {
      this.router.navigate(['/tracking']);
    });
  }

  private backupStorage(): void {
    this.storageSnapshot.clear();
    this.storageKeys.forEach((key) => {
      this.storageSnapshot.set(key, localStorage.getItem(key));
    });
  }

  private restoreStorage(): void {
    this.storageKeys.forEach((key) => {
      const snapshot = this.storageSnapshot.get(key);
      if (snapshot === null || snapshot === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, snapshot);
      }
    });
  }

  private determineContextYear(context: TrackingTaskEditContext): ScheduleYear {
    if (context?.year === '2026') {
      return '2026';
    }

    if (context?.originalStage && Number(context.originalStage) > 5) {
      return '2026';
    }
    return '2025';
  }
}

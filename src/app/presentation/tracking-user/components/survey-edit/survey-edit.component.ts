import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, Type } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { InformationImplementationComponent } from 'app/presentation/survey/home/information-implementation/information-implementation.component';
import { Stage1Component } from 'app/presentation/survey/home/stage/stage-1/stage-1.component';
import { Stage2Component } from 'app/presentation/survey/home/stage/stage-2/stage-2.component';
import { Stage3Component } from 'app/presentation/survey/home/stage/stage-3/stage-3.component';
import { Stage4Component } from 'app/presentation/survey/home/stage/stage-4/stage-4.component';
import { Stage5Component } from 'app/presentation/survey/home/stage/stage-5/stage-5.component';
import { Stage1Component as Stage1Component2026 } from 'app/presentation/survey/home/stage-2026/stage-1/stage-1.component';
import { Stage2Component as Stage2Component2026 } from 'app/presentation/survey/home/stage-2026/stage-2/stage-2.component';
import { Stage3Component as Stage3Component2026 } from 'app/presentation/survey/home/stage-2026/stage-3/stage-3.component';
import { Stage4Component as Stage4Component2026 } from 'app/presentation/survey/home/stage-2026/stage-4/stage-4.component';
import { Stage5Component as Stage5Component2026 } from 'app/presentation/survey/home/stage-2026/stage-5/stage-5.component';
import { ConfigSurvey } from 'app/shared/constants/configs';
import { TemporalSaveService } from 'app/shared/services/temporal-save.service';
import {
  disableSurveyEditMode,
  enableSurveyEditMode,
} from 'app/shared/utils/survey-mode';
import {
  ScheduleYear,
  setActiveStageYear,
} from 'app/shared/utils/stage-storage.util';
import { Router } from '@angular/router';

interface StageOption {
  label: string;
  value: number;
}

interface TaskOption {
  label: string;
  value: number;
}
interface YearOption {
  label: string;
  value: ScheduleYear;
}

@Component({
  selector: 'app-survey-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InformationImplementationComponent,
    Stage1Component,
    Stage2Component,
    Stage3Component,
    Stage4Component,
    Stage5Component,
    Stage1Component2026,
    Stage2Component2026,
    Stage3Component2026,
    Stage4Component2026,
    Stage5Component2026,
  ],
  templateUrl: './survey-edit.component.html',
  styleUrls: ['./survey-edit.component.css'],
})
export class SurveyEditComponent implements OnDestroy {
  form: FormGroup;
  private stageChangeSub?: Subscription;

  stageOptions: StageOption[] = ConfigSurvey.SCHEDULE_CONFIG.map(
    (stageConfig: { labelStage: string; stage: number }) => ({
      label: stageConfig.labelStage,
      value: stageConfig.stage,
    }),
  );
  taskOptions: TaskOption[] = [];
  yearOptions: YearOption[] = [
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
  ];

  selectedStage: number | null = null;
  selectedPhase: number | null = null;
  selectedYear: ScheduleYear | null = null;
  backendStage: number | null = null;
  stageRenderKey = 0;
  isRecordLoading = false;
  childLoading = false;
  showSurvey = false;
  errorMessage = '';

  private readonly stageComponentMap: Record<
    ScheduleYear,
    Record<number, Type<any>>
  > = {
    '2025': {
      1: Stage1Component,
      2: Stage2Component,
      3: Stage3Component,
      4: Stage4Component,
      5: Stage5Component,
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
  private readonly stageContextStorageKey = 'surveyEditStageContext';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private temporalSaveService: TemporalSaveService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.buildForm();
    this.initStageWatcher();
    this.backupStorage();
    this.temporalSaveService.init(ConfigSurvey.STAGE_PHASE_CONFIG);
  }

  ngOnDestroy(): void {
    this.stageChangeSub?.unsubscribe();
    this.restoreStorage();
    disableSurveyEditMode();
  }

  goBack(): void {
    this.router.navigate(['/tracking-user']);
  }

  get controls() {
    return this.form.controls;
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
    const year = this.selectedYear ?? '2025';
    return this.stageComponentMap[year]?.[this.selectedStage] ?? null;
  }

  async loadSurvey(): Promise<void> {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const codigoLocal = this.form.value.codigoLocal?.trim();
    const numeroDocumento = this.form.value.numeroDocumento?.trim();
    const stage = Number(this.form.value.stage);
    const task = Number(this.form.value.task);
    const yearControl = this.form.value.year as ScheduleYear | null;

    if (!codigoLocal || !numeroDocumento) {
      this.errorMessage =
        'Debes ingresar el código local y el número de documento.';
      return;
    }

    if (!yearControl) {
      this.errorMessage = 'Debes seleccionar el año.';
      return;
    }

    const scheduleYear = this.normalizeYear(yearControl);
    const backendStage = this.resolveBackendStage(stage, scheduleYear);

    this.isRecordLoading = true;
    try {
      this.persistContext(numeroDocumento, codigoLocal, scheduleYear);
      this.setStageConfig(scheduleYear);
      this.setCurrentSurvey(stage, task);
      this.persistBackendStageContext(stage, backendStage, scheduleYear);
      setActiveStageYear(scheduleYear);
      enableSurveyEditMode();

      this.selectedStage = stage;
      this.selectedPhase = task;
      this.selectedYear = scheduleYear;
      this.backendStage = backendStage;
      this.stageRenderKey++;
      this.showSurvey = true;
      this.childLoading = false;
    } catch (error) {
      console.error('Error al preparar el registro para edición:', error);
      this.errorMessage =
        'No se pudo preparar la información seleccionada. Verifica la fase y tarea.';
    } finally {
      this.isRecordLoading = false;
      this.cdr.markForCheck();
    }
  }

  clearSelection(): void {
    this.form.reset();
    this.taskOptions = [];
    this.selectedStage = null;
    this.selectedPhase = null;
    this.selectedYear = null;
    this.backendStage = null;
    this.clearBackendStageContext();
    setActiveStageYear('2025');
    this.stageRenderKey++;
    this.showSurvey = false;
    this.errorMessage = '';
    disableSurveyEditMode();
    this.restoreStorage();
    this.backupStorage();
  }

  handleChildLoading(isLoading: boolean): void {
    this.childLoading = isLoading;
  }

  private buildTaskOptions(stage: number | null | undefined): TaskOption[] {
    if (!stage) {
      return [];
    }
    const foundStage = ConfigSurvey.SCHEDULE_CONFIG.find(
      (item: {
        stage: number;
        survey: Array<{ label: string; survey: string | number }>;
      }) => item.stage === stage,
    );
    if (!foundStage) {
      return [];
    }
    return foundStage.survey.map(
      (surveyConfig: { label: string; survey: string | number }) => ({
        label: surveyConfig.label,
        value: Number(String(surveyConfig.survey).split('-')[1]),
      }),
    );
  }

  private persistContext(
    numeroDocumento: string,
    codigoLocal: string,
    year: ScheduleYear,
  ): void {
    const payload = {
      NUMERO_DOCUMENTO: numeroDocumento,
      CODIGO_LOCAL: codigoLocal,
      REGISTRADO: true,
      YEAR: year,
    };
    localStorage.setItem('dataUser', JSON.stringify(payload));
    localStorage.removeItem('dataInformationImplementation');
    localStorage.removeItem('currentSurvey');
    this.temporalSaveService.emitChangeStatusTarea(true);
  }

  private setStageConfig(year: ScheduleYear): void {
    const schedulePayload = ConfigSurvey.SCHEDULE_CONFIG.map(
      (stageConfig: any) => ({
        ...stageConfig,
        YEAR: year,
        year,
        survey:
          stageConfig?.survey?.map((survey: any) => ({ ...survey })) ?? [],
      }),
    );
    localStorage.setItem('stage', JSON.stringify(schedulePayload));
  }

  private setCurrentSurvey(stage: number, task: number): void {
    const found = ConfigSurvey.STAGE_PHASE_CONFIG.find(
      (item: { stage: number; phase: number; questions: unknown }) =>
        item.stage === stage && item.phase === task,
    );
    if (!found) {
      throw new Error('No existe una configuración para la fase seleccionada.');
    }
    this.temporalSaveService.saveCurrentQuestionTemp(found.questions);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      codigoLocal: ['', [Validators.required, this.trimmedRequiredValidator]],
      numeroDocumento: [
        '',
        [Validators.required, this.trimmedRequiredValidator],
      ],
      stage: [null as number | null, [Validators.required]],
      task: [null as number | null, [Validators.required]],
      year: [null as ScheduleYear | null, [Validators.required]],
    });
  }

  private readonly trimmedRequiredValidator = (control: AbstractControl) => {
    const value = control.value;

    if (typeof value !== 'string') {
      return null;
    }

    return value.trim() ? null : { required: true };
  };

  private initStageWatcher(): void {
    const stageControl = this.form.get('stage');
    const taskControl = this.form.get('task');

    this.stageChangeSub = stageControl?.valueChanges.subscribe((value) => {
      const parsedStage = typeof value === 'string' ? Number(value) : value;

      if (value !== parsedStage) {
        stageControl.setValue(parsedStage, { emitEvent: false });
      }

      this.taskOptions = this.buildTaskOptions(parsedStage);
      taskControl?.setValue(null, { emitEvent: false });
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

  private resolveBackendStage(stage: number, year: ScheduleYear): number {
    if (year === '2026') {
      return stage + 5;
    }
    return stage;
  }

  private normalizeYear(value: ScheduleYear | string): ScheduleYear {
    return value === '2026' ? '2026' : '2025';
  }

  private persistBackendStageContext(
    uiStage: number,
    backendStage: number,
    year: ScheduleYear,
  ): void {
    const payload = {
      uiStage,
      backendStage,
      year,
    };
    sessionStorage.setItem(
      this.stageContextStorageKey,
      JSON.stringify(payload),
    );
  }

  private clearBackendStageContext(): void {
    sessionStorage.removeItem(this.stageContextStorageKey);
  }
}

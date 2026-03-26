import { LoadingService } from './../../../shared/services/loading.service';
import { ConfigSurvey } from './../../../shared/constants/configs';
import { TemporalSaveService } from './../../../shared/services/temporal-save.service';
import { Component, Type, ViewChild } from '@angular/core';
import { IeIdentificationComponent } from './ie-identification/ie-identification.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScheduleComponent } from './schedule/schedule.component';
import { Schedule2026Component } from './schedule-2026/schedule-2026.component';
import { InformationImplementationComponent } from './information-implementation/information-implementation.component';
import { Stage1Component as Stage1Component2025 } from './stage/stage-1/stage-1.component';
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
import { Stage2Component as Stage2Component2025 } from './stage/stage-2/stage-2.component';
import { Stage3Component as Stage3Component2025 } from './stage/stage-3/stage-3.component';
import { Stage4Component as Stage4Component2025 } from './stage/stage-4/stage-4.component';
import { Stage5Component as Stage5Component2025 } from './stage/stage-5/stage-5.component';
import { Stage1Component as Stage1Component2026 } from './stage-2026/stage-1/stage-1.component';
import { Stage2Component as Stage2Component2026 } from './stage-2026/stage-2/stage-2.component';
import { Stage3Component as Stage3Component2026 } from './stage-2026/stage-3/stage-3.component';
import { Stage4Component as Stage4Component2026 } from './stage-2026/stage-4/stage-4.component';
import { Stage5Component as Stage5Component2026 } from './stage-2026/stage-5/stage-5.component';
import { SelectModule } from 'primeng/select';
import {
  ScheduleYear,
  setActiveStageYear,
} from 'app/shared/utils/stage-storage.util';
//agregue
import {  ViewContainerRef, ComponentRef } from '@angular/core';

interface StageSelectionPayload {
  stage: string;
  phase: string;
  countQuestion: number;
  year?: ScheduleYear;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    IeIdentificationComponent,
    ScheduleComponent,
    Schedule2026Component,
    InformationImplementationComponent,
    SelectModule,
  ],
  providers: [
    { provide: ISurveyRepository, useClass: SurveyRepository },
    { provide: SaveStagePhaseCommand, useClass: SaveStagePhaseHandler },
    { provide: SaveConfigurationCommand, useClass: SaveConfigurationHandler },
    LoadingService,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  initialConfig = ConfigSurvey.STAGE_PHASE_CONFIG;
  @ViewChild(ScheduleComponent) schedule2025Component?: ScheduleComponent;
  @ViewChild(Schedule2026Component) schedule2026Component?: Schedule2026Component;
  //agregue
  @ViewChild('stageContainer', { read: ViewContainerRef })
  stageContainer!: ViewContainerRef;
  private stageComponentRef?: ComponentRef<any>;
  //agregue

  //schedule2026Component?: Schedule2026Component;

  currentStep = 1;
  selectedStage = 0;
  selectedPhase = 1;
  countQuestion = 0;

  selectedScheduleYear: ScheduleYear | null = null;
  scheduleCards: Array<{
    year: ScheduleYear;
    title: string;
    description: string;
    icon: string;
  }> = [
      {
        year: '2025',
        title: 'Implementacion 2025',
        description: 'Plan de implementación del año anterior',
        icon: 'pi-calendar',
      },
      {
        year: '2026',
        title: 'Implementacion 2026',
        description: 'Plan de implementación del presente año',
        icon: 'pi-calendar',
      },
    ];

  private readonly stageComponentMap: Record<
    ScheduleYear,
    Record<number, Type<any>>
  > = {
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
    isLoading: (value: boolean) => this.isLoadingRefresh(value),
  };

  get stageInputs() {
    return {
      question: this.currentStep,
      phase: this.selectedPhase,
      isAllStagesCompleted: this.isAllStagesCompleted,
    };
  }

  get stageComponentToRender(): Type<any> | null {
    if (!this.selectedStage) {
      return null;
    }
    const year = this.selectedScheduleYear ?? '2025';
    return this.stageComponentMap[year]?.[this.selectedStage] ?? null;
  }

  isLoading: boolean = true;

  saveQuestionTemp: any = null;

  private loadingServiceSubscription: Subscription | undefined;
  private destroy$ = new Subject<void>(); // Subject para manejar el ciclo de vida de las suscripciones

  isAllStagesCompleted: boolean = false;

  constructor(
    private router: Router,
    private _SaveStagePhaseCommand: SaveStagePhaseCommand,
    private _SaveConfigurationCommand: SaveConfigurationCommand,
    private _TemporalSaveService: TemporalSaveService,
    private _LoadingService: LoadingService,
    private cdr: ChangeDetectorRef, // Inyectar ChangeDetectorRef
  ) {
    this._TemporalSaveService.init(this.initialConfig);
  }

  ngOnInit() { }

  selectScheduleCard(year: ScheduleYear) {
    setActiveStageYear(year);

    if (this.selectedScheduleYear !== year) {
      this.resetStageSelection();
      this.selectedScheduleYear = year;
    }

    this.refreshSchedule();
    this.cdr.detectChanges();
  }
  /*
    private resetStageSelection() {
      this.selectedStage = 0;
      this.selectedPhase = 1;
      this.currentStep = 1;
      this.countQuestion = 0;
      this.isLoading = true;
    }*/
  //agregue
  private resetStageSelection() {
    this.selectedStage = 0;
    this.selectedPhase = 1;
    this.currentStep = 1;
    this.countQuestion = 0;
    this.isLoading = true;

    if (this.stageContainer) {
      this.stageContainer.clear();
    }
  }
  //agregue

  defaultValues() {
    this.currentStep = 1;
    this.selectedStage = 0;
    this.selectedPhase = 1;
    this.countQuestion = 0;
    if (localStorage.getItem('dataInformationImplementation')) {
      localStorage.removeItem('dataInformationImplementation');
    }
    if (localStorage.getItem('currentSurvey')) {
      localStorage.removeItem('currentSurvey');
    }
  }

  async selectedStageExc(selectStage: StageSelectionPayload) {
    // let isComplete = await this.isSelectComplete(selectStage);
    // if(isComplete) {
    //   this.selectedEvent(selectStage);
    // }else{
    //   let extraEvent = await this.extraEvent(selectStage);
    //   if (!extraEvent) {
    //     this.selectedEvent(selectStage);
    //   }
    // }
    if (selectStage?.year) {
      this.selectedScheduleYear = selectStage.year;
      setActiveStageYear(selectStage.year);
    } else if (this.selectedScheduleYear) {
      setActiveStageYear(this.selectedScheduleYear);
    } else {
      this.selectedScheduleYear = '2025';
      setActiveStageYear('2025');
    }
    this.selectedEvent(selectStage);
  }

  private async processTempStage(selectStage: any): Promise<void> {
    const tempStage = await this._TemporalSaveService
      .getStage()
      .pipe(take(1))
      .toPromise();

    if (tempStage) {
      const tempSelectedStage = parseInt(selectStage?.stage);
      const existingSage = tempStage.filter(
        (item: any) => item.stage === tempSelectedStage,
      );
      if (existingSage.length) {
        const filterEnable = existingSage[0].survey.filter(
          (item: any) => item.enable === true,
        );
        if (filterEnable.length) {
          this.isAllStagesCompleted = filterEnable.every(
            (survey: any) => survey.complete === true,
          );
        }
      }
    }
  }

  //agregue
  private renderStage() {
    if (!this.stageComponentToRender || !this.stageContainer) return;

    // limpiar componente anterior
    this.stageContainer.clear();

    // crear componente
    this.stageComponentRef = this.stageContainer.createComponent(
      this.stageComponentToRender
    );

    // PASAR INPUTS
    this.stageComponentRef.instance.question = this.currentStep;
    this.stageComponentRef.instance.phase = this.selectedPhase;
    this.stageComponentRef.instance.isAllStagesCompleted =
      this.isAllStagesCompleted;

    // ESCUCHAR OUTPUT
    if (this.stageComponentRef.instance.isLoading) {
      this.stageComponentRef.instance.isLoading
        .pipe(takeUntil(this.destroy$))
        .subscribe((value: boolean) => {
          this.isLoadingRefresh(value);
        });
    }

    this.cdr.detectChanges();
  }
  //agregue

  private async isSelectComplete(selectStage: any) {
    const tempStage = await this._TemporalSaveService
      .getStage()
      .pipe(take(1))
      .toPromise();

    if (tempStage) {
      const tempSelectedStage = parseInt(selectStage?.stage);
      const existingSage = tempStage.filter(
        (item: any) => item.stage === tempSelectedStage,
      );
      if (existingSage.length) {
        const filterEnable = existingSage[0].survey.filter(
          (item: any) => item.enable === true,
        );
        if (filterEnable.length) {
          const selectedStage = parseInt(selectStage?.stage);
          const selectedPhase = parseInt(selectStage?.phase);
          let survey = `${selectedStage}-${selectedPhase}`;
          return filterEnable.some(
            (item: any) => item.complete === true && item.survey === survey,
          );
        }
        return false;
      }
      return false;
    }

    return false;
  }

  async selectedEvent(selectStage: any) {
    this.isLoading = true;

    await this.processTempStage(selectStage);

    this._TemporalSaveService.getData().subscribe((item) => {
      this.defaultValues();
      const selectedStage = parseInt(selectStage?.stage);
      const selectedPhase = parseInt(selectStage?.phase);
      if (item) {
        const existingDataIndex = item.filter(
          (item: any) =>
            item.stage === selectedStage && item.phase === selectedPhase,
        );
        if (existingDataIndex.length) {
          this._TemporalSaveService.saveCurrentQuestionTemp(
            existingDataIndex[0].questions,
          );
        }
      }
      this.selectedStage = selectedStage;
      this.selectedPhase = selectedPhase;
      this.countQuestion = selectStage?.countQuestion;
      this.countQuestion++;
      this.isLoading = false;

      // renderizar componente dinámico
      setTimeout(() => {
        this.renderStage();
      });

    });
  }

  async extraEvent(selectStage: any) {
    const selectedStage = parseInt(selectStage?.stage);
    const selectedPhase = parseInt(selectStage?.phase);
    let obj = [
      {
        stage: 1,
        phase: 4,
        event: () => {
          Swal.fire({
            text: '¿Se implementó la tarea 1.4: Asistencia técnica para el seguimiento de la implementación del plan de condiciones operativas?',
            icon: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
            allowOutsideClick: false,
          }).then((result: any) => {
            Swal.fire({
              title: 'Guardando datos...',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });
            if (result.value) {
              this.selectedEvent(selectStage);
            } else {
              if (result.dismiss !== Swal.DismissReason.close) {
                let mensaje = 'Sin asistencia tecnica';
                this.fillNextStagePhase(selectStage, mensaje, false);
                this.saveDateStagePhase();
                this.refreshSchedule();
              }
            }
            Swal.close();
          });
        },
      },
    ];
    const foundEvent = obj.find(
      (item) => item.stage === selectedStage && item.phase === selectedPhase,
    );

    if (!foundEvent) {
      return false;
    }

    foundEvent.event();
    return true;
  }

  fillNextStagePhase(
    selectStage: any,
    extraInfo: string = '',
    selectStageEnable: boolean = true,
  ) {
    const savedStage: any = localStorage.getItem('stage');
    if (savedStage) {
      const selectedStage = parseInt(selectStage?.stage);
      const selectedPhase = parseInt(selectStage?.phase);
      let stages = JSON.parse(savedStage);
      stages.map((stage: any) => {
        if (stage.stage == selectedStage) {
          stage.survey.map((survey: any) => {
            if (survey.survey == `${selectedStage}-${selectedPhase}`) {
              survey.complete = true;
              // survey.enable = selectStageEnable; se deshabilita porque el dato de no usar va a venir por default
              survey.enable = true;
              if (extraInfo) {
                survey.extraInfo = extraInfo;
              }

              const nextSurvey = stages
                .find((stage: any) => stage.stage == selectedStage)
                ?.survey.find(
                  (survey: any) =>
                    survey.survey == `${selectedStage}-${selectedPhase + 1}`,
                );
              if (nextSurvey) {
                nextSurvey.enable = true;
                nextSurvey.prevComplete = true;
              }
            }
          });
        }
      });
      localStorage.setItem('stage', JSON.stringify(stages));
      this.cdr.detectChanges(); // Ensure UI updates after localStorage changes
    }
  }

  async saveDateStagePhase() {
    try {
      const dataUser: any = localStorage.getItem('dataUser');
      let numeroDocumento = '';
      let codigoLocal = '';
      if (dataUser) {
        numeroDocumento = JSON.parse(dataUser)?.NUMERO_DOCUMENTO;
        codigoLocal = JSON.parse(dataUser)?.CODIGO_LOCAL;

        let stage = localStorage.getItem('stage');
        if (stage) {
          const objSave = {
            NUMERO_DOCUMENTO: numeroDocumento,
            CODIGO_LOCAL: codigoLocal,
            DATOS_JSON: stage,
          };

          let result = await this._SaveConfigurationCommand.execute(objSave);
          if (result) {
            console.log(
              'Se guardo correctamente la configuracion de la encuesta',
            );
          }
        }
      }
    } catch (error) {
      console.error('Error al guardar la configuración de la encuesta:', error);
    }
  }

  refreshSchedule() {
    this.schedule2025Component?.refreshStage();
    this.schedule2026Component?.refreshStage();
    this.cdr.detectChanges(); // Ensure UI updates after refreshing the schedule
  }

  isLoadingRefresh(isLoading: any) {
    this.isLoading = isLoading;
    this.cdr.detectChanges(); // Ensure UI updates after loading state changes
  }

  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();

  if (this.stageComponentRef) {
    this.stageComponentRef.destroy();
  }
}
}

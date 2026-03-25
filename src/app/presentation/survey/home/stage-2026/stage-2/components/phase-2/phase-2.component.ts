import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Subject, take } from 'rxjs';
import Swal from 'sweetalert2';

import { TemporalSaveService } from './../../../../../../../shared/services/temporal-save.service';
import { CommentsComponent } from '../../../../../components/comments/comments.component';
import { Quest1Component } from './quest-1/quest-1.component';
import { Quest2Component } from './quest-2/quest-2.component';
import { ButtonsComponent } from 'app/presentation/survey/components/buttons/buttons.component';
import { SaveStagePhaseCommand } from 'app/application/survey/save-stage-phase/save-stage-phase.command';
import { SaveStagePhaseHandler } from 'app/application/survey/save-stage-phase/save-stage-phase.handler';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { SurveyRepository } from 'app/infrastructure/repositories/survey.repository';
import { SaveConfigurationCommand } from 'app/application/survey/save-configuration/save-configuration.command';
import { SaveConfigurationHandler } from 'app/application/survey/save-configuration/save-configuration.handler';
import { UpdateConfigurationCommand } from 'app/application/survey/update-configuration/update-configuration.command';
import { UpdateConfigurationHandler } from 'app/application/survey/update-configuration/update-configuration.handler';
import { GetSurveyDataHandler } from 'app/application/survey/get-survey-data/get-survey-data.handler';
import { GetSurveyDataQuery } from 'app/application/survey/get-survey-data/get-survey-data.query';
import { SkeletonSurveyComponent } from 'app/presentation/survey/components/skeleton-survey/skeleton-survey.component';
import { UpdateStagePhaseCommand } from 'app/application/survey/update-stage-phase/update-stage-phase.command';
import { UpdateStagePhaseHandler } from 'app/application/survey/update-stage-phase/update-stage-phase.handler';
import { UndoneTaskComponent } from "app/presentation/survey/components/undone-task/undone-task.component";
import { isSurveyEditMode } from "app/shared/utils/survey-mode";
import { getActiveStageYear, setActiveStageYear } from 'app/shared/utils/stage-storage.util';
import { resolveApiStage } from 'app/shared/utils/stage-year-mapper.util';

@Component({
  selector: 'app-phase-2',
  imports: [
    Quest1Component,
    Quest2Component,
    CommentsComponent,
    CommonModule,
    ButtonsComponent,
    SkeletonSurveyComponent,
    UndoneTaskComponent
  ],
  providers: [
    { provide: ISurveyRepository, useClass: SurveyRepository },
    { provide: SaveStagePhaseCommand, useClass: SaveStagePhaseHandler },
    { provide: SaveConfigurationCommand, useClass: SaveConfigurationHandler },
    { provide: UpdateConfigurationCommand, useClass: UpdateConfigurationHandler },
    { provide: GetSurveyDataQuery, useClass: GetSurveyDataHandler },
    { provide: UpdateStagePhaseCommand, useClass: UpdateStagePhaseHandler },
  ],
  templateUrl: './phase-2.component.html',
  styleUrls: ['./phase-2.component.css']
})
export class Phase2Component {
  objQuestion: any = null;
  @Input() question: number = 1;
  @Input() isAllStagesCompleted: boolean = false;
  phase: number = 2;
  stage: number = 2;
  @ViewChild(Quest1Component) quest1Component!: Quest1Component;
  @ViewChild(Quest2Component) quest2Component!: Quest2Component;
  @ViewChild(CommentsComponent) commentsComponent!: CommentsComponent;
  @ViewChild(UndoneTaskComponent) undoneTaskComponent!: UndoneTaskComponent;

  archivoActa: any = null;
  archivoFoto: any = null;
  isCompletePhase: boolean = false;
  archivoName: any = null;
  isLoading: any = true;
  @Output() isLoadingInformation = new EventEmitter<boolean>(); // Define the @Output property
  isUpdateEnable: boolean = true;
  tareaImplementada: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private _SaveStagePhaseCommand: SaveStagePhaseCommand,
    private _SaveConfigurationCommand: SaveConfigurationCommand,
    private _UpdateConfigurationCommand: UpdateConfigurationCommand,
    private _GetSurveyDataQuery: GetSurveyDataQuery,
    private _TemporalSaveService: TemporalSaveService,
    private _UpdateStagePhaseCommand: UpdateStagePhaseCommand,
    private router: Router
  ) { }

  ngOnInit() {
    this.ensureActiveStageYear();
    this.getDataSaved();
    this._TemporalSaveService.dataNoTarea$.subscribe(data => {
      this.tareaImplementada = data;
      this.question = data ? 1 : 3;
    });
  }
  showComments(): boolean {
    return this.question == 3 && this.tareaImplementada;
  }

  showUndoneTask(): boolean {
    return this.question == 3 && !this.tareaImplementada;
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emite un valor para finalizar las suscripciones
    this.destroy$.complete(); // Completa el Subject
  }

  progressBarWidthClass(currentStep: number = 0, countQuestion: number = 0) {
    return `${(currentStep / countQuestion) * 100}`;
  }

  async nextStep(step: number) {
    const stagePhaseMap: { [key: string]: any } = {
      1: this.quest1Component,
      2: this.quest2Component
    };

    const currentViewChild = stagePhaseMap[step];

    if (currentViewChild) {
      const isValid = currentViewChild.validateDataSave();

      if (!isValid) {
        Swal.fire({
          text: 'Para continuar, completa todos los campos y verifica que la información sea válida.',
          icon: 'warning',
        });
        return;
      } else {
        let item =
          (await this._TemporalSaveService
            .getCurrentQuestionTemp()
            .pipe(take(1))
            .toPromise()) ?? [];

        const answerPayload = currentViewChild.getDataSave();
        const existingDataIndex = item.findIndex(
          (entry: any) => entry.question === step
        );

        if (existingDataIndex > -1) {
          item[existingDataIndex].answer = answerPayload;
        } else {
          item.push({ question: step, answer: answerPayload });
        }

        this._TemporalSaveService.saveCurrentQuestionTemp(item);

        this.question++;
      }
    }
  }

  previousStep(step: number) {
    this.question--;
  }

  private async validateAndSaveCurrentViewChild(step: number, currentViewChild: any): Promise<any> {
    if (!currentViewChild) {
      Swal.fire({
        text: 'Ha ocurrido un error',
        icon: 'warning',
      });
      return null;
    }

    const isValid = currentViewChild.validateDataSave();
    if (!isValid) {
      Swal.fire({
        text: 'Para continuar, completa todos los campos y verifica que la información sea válida.',
        icon: 'warning',
      });
      return null;
    }

    const isValidInfoImplem = await this.validateDataInformationImplementation();
    if (!isValidInfoImplem?.fechaModalidad) {
      Swal.fire({
        html: 'No se puede continuar sin completar todos los campos requeridos en la información de la implementación,<span style="color:red;font-weight:bold">falta ingresar fecha de implementación</span>',
        icon: 'warning',
      });
      return null;
    }
    if (isValidInfoImplem?.modalidad === null || isValidInfoImplem?.modalidad === undefined) {
      Swal.fire({
        html: 'No se puede continuar sin completar todos los campos requeridos en la información de la implementación,<span style="color:red;font-weight:bold"> falta seleccionar la modalidad</span>',
        icon: 'warning',
      });
      return null;
    }

    let temporalData =
      (await this._TemporalSaveService
        .getCurrentQuestionTemp()
        .pipe(take(1))
        .toPromise()) ?? [];

    const existingDataIndex = temporalData.findIndex((item: any) => item.question === step);
    if (existingDataIndex > -1) {
      let saveData: any = currentViewChild.getDataSave();
      this.archivoActa = saveData?.archivoActa ?? '';
      this.archivoFoto = saveData?.archivoFoto ?? '';
      delete saveData.archivoActa;
      delete saveData.archivoFoto;
      temporalData[existingDataIndex].answer = saveData;
    } else {
      let saveData: any = currentViewChild.getDataSave();
      this.archivoActa = saveData?.archivoActa ?? '';
      this.archivoFoto = saveData?.archivoFoto ?? '';
      delete saveData.archivoActa;
      delete saveData.archivoFoto;
      temporalData.push({ question: step, answer: saveData });
    }

    this._TemporalSaveService.saveCurrentQuestionTemp(temporalData);
    return temporalData;
  }

  private async saveSurveyData(temporalData: any): Promise<boolean> {
    const targetYear = this.ensureActiveStageYear();
    const savedStage: any = localStorage.getItem('stage');
    if (!savedStage) return false;
    const stages = JSON.parse(savedStage);
    if (!Array.isArray(stages)) return false;

    const pickStageYear = (stageEntry: any) => stageEntry?.YEAR ?? stageEntry?.year ?? targetYear;
    const currentStageConfig = stages.find(
      (stage: any) => stage.stage == this.stage && pickStageYear(stage) === targetYear
    );

    if (!currentStageConfig) {
      Swal.fire({
        text: 'No se encontró la configuración del año activo para esta fase. Vuelva a seleccionar el año e intente nuevamente.',
        icon: 'warning',
      });
      return false;
    }

    const stageYear = pickStageYear(currentStageConfig);
    const apiStage = resolveApiStage(this.stage, stageYear);

    const dataUser: any = localStorage.getItem('dataUser');
    let numeroDocumento = '';
    let codigoLocal = '';
    if (dataUser) {
      numeroDocumento = JSON.parse(dataUser)?.NUMERO_DOCUMENTO;
      codigoLocal = JSON.parse(dataUser)?.CODIGO_LOCAL;
    }

    const temporalDataInformationImplementation = await this._TemporalSaveService
      .getDataInformationImplementation()
      .pipe(take(1))
      .toPromise();

    const objLog = {
      NUMERO_DOCUMENTO: numeroDocumento,
      CODIGO_LOCAL: codigoLocal,
      FASE: apiStage,
      TAREA: this.phase,
      DATOS_JSON: JSON.stringify(temporalData),
      ARCHIVO_ACTA: this.archivoActa ?? '',
      ARCHIVO_EVIDENCIA: this.archivoFoto ?? '',
      FECHA_MODALIDAD: temporalDataInformationImplementation.fechaModalidad,
      MODALIDAD: temporalDataInformationImplementation.modalidad,
      REGISTRA_TAREA: this.tareaImplementada,
      YEAR: stageYear
    };
    /*
    console.log('[Stage-2026][Phase-2] Payload to insertar', {
      ...objLog,
      ARCHIVO_ACTA: this.archivoActa ? this.archivoActa.name : '(sin acta)',
      ARCHIVO_EVIDENCIA: this.archivoFoto ? this.archivoFoto.name : '(sin evidencia)'
    });
    */
    const objLogConfiguration = {
      DATOS_JSON: JSON.stringify(temporalData),
      ARCHIVO_ACTA: this.archivoActa ? this.archivoActa.name : '',
      ARCHIVO_EVIDENCIA: this.archivoFoto ? this.archivoFoto.name : '',
      FECHA_MODALIDAD: temporalDataInformationImplementation.fechaModalidad,
      MODALIDAD: temporalDataInformationImplementation.modalidad,
      REGISTRA_TAREA: this.tareaImplementada,
      YEAR: stageYear
    }

    let esTareaNoImplementada = temporalDataInformationImplementation?.esTareaNoImplementada || false;

    try {
      const result: any = await (this.isCompletePhase ? this._UpdateStagePhaseCommand.execute(objLog) : this._SaveStagePhaseCommand.execute(objLog));
      if (result) {
        stages.map((stage: any) => {
          if (stage.stage == this.stage && pickStageYear(stage) === stageYear) {
            stage.survey.map((survey: any) => {
              if (survey.survey == `${this.stage}-${this.phase}`) {
                survey.complete = true;
                survey.dataSaved = objLogConfiguration;
                const nextSurvey = stages
                  .find((stage: any) => stage.stage == this.stage && pickStageYear(stage) === stageYear)
                  ?.survey.find(
                    (survey: any) => survey.survey == `${this.stage}-${this.phase + 1}`
                  );
                if (nextSurvey) nextSurvey.prevComplete = true;
              }
            });
          }
        });
        localStorage.setItem('stage', JSON.stringify(stages));
        return true;
      }
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      Swal.fire({
        text: 'Ha ocurrido un error al guardar los datos',
        icon: 'error',
      }).then((result: any) => {
        Swal.close();
      })
      return false;
    }
    return false;
  }

  public async finishSurvey(step: number) {
    const temporalData = await this.validateAndSaveCurrentViewChild(step, this.tareaImplementada ? this.commentsComponent : this.undoneTaskComponent);
    if (!temporalData) return;

    Swal.fire({
      text: '¿Esta seguro de registrar esta tarea?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    }).then(async (result: any) => {
      if (result.value) {
        Swal.fire({
          title: 'Guardando datos...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const isSaved = await this.saveSurveyData(temporalData);

        if (isSaved) {
          const saveStage = await this.saveDateStagePhase();
          Swal.close();
          return this.alertfinishSurvey();
        }
      }
    });
  }

  redirectToSignIn() {
    localStorage.removeItem('access_token');
    window.location.href = '/auth/sign-in';
  }

  alertfinishSurvey() {
    Swal.fire({
      title: 'Tarea completada',
      text: 'Gracias por participar',
      icon: 'success',
      confirmButtonColor: '#22c55e',
      confirmButtonText: 'Continuar',
    }).then(() => {
      this.GoToSelectStage();
    });
  }

  GoToSelectStage() {
    if (isSurveyEditMode()) {
      if (this.router.url.includes('/tracking-user')) {
        this._TemporalSaveService.requestClearTrackingUserSelection();
      } else {
        this._TemporalSaveService.requestGoBackToTracking();
      }
      return;
    }
    this.router.navigate(['/']).then(() => {
      this.router.navigate(['/survey']);
    });
  }

  async validateDataInformationImplementation() {
    try {

      const data = await firstValueFrom(
        this._TemporalSaveService.getDataInformationImplementation().pipe(take(1))
      );

      if (!data) {
        return false;
      }

      //  if(data?.esTareaNoImplementada){
      //   return data?.fechaModalidad != null && data?.modalidad != null && data?.extraInfo;
      // }

      return data;
    } catch (error) {
      console.error('Error al validar la información de implementación:', error);
      return false;
    }
  }

  async saveDateStagePhase() {
    const stageYear = this.ensureActiveStageYear();
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
            YEAR: stageYear,
          }

          let result = await (dataUser?.REGISTRADO ? this._UpdateConfigurationCommand.execute(objSave) : this._SaveConfigurationCommand.execute(objSave));
          if (result) {
            console.log(
              'Se guardo correctamente la configuracion de la encuesta'
            );
          }
        }
      }
    } catch (error) {
      console.error('Error al guardar la configuración de la encuesta:', error);
    }
  }

  async getDataSaved() {
    const targetYear = this.ensureActiveStageYear();
    try {
      this.isLoading = true;

      const dataUser = localStorage.getItem('dataUser');
      const savedStage = localStorage.getItem('stage');

      if (!dataUser || !savedStage) return;


      const { NUMERO_DOCUMENTO: numeroDocumento, CODIGO_LOCAL: codigoLocal } = JSON.parse(dataUser);
      const stages = JSON.parse(savedStage);
      if (!Array.isArray(stages)) return;
      const pickStageYear = (stageEntry: any) => stageEntry?.YEAR ?? stageEntry?.year ?? targetYear;

      const currentStage = stages.find((s: any) => s.stage === this.stage && pickStageYear(s) === targetYear);
      if (!currentStage) return;

      const currentSurvey = currentStage.survey.find((survey: any) => survey.survey === `${this.stage}-${this.phase}`);
      if (!currentSurvey) return;

      /*
      if (!currentSurvey.dataSaved) {
        this.resetFormState();
        return;
      }*/

      const stageYear = pickStageYear(currentStage);
      const apiStage = resolveApiStage(this.stage, stageYear);

      const objParam = {
        CODIGO_LOCAL: codigoLocal,
        NUMERO_DOCUMENTO: numeroDocumento,
        FASE: apiStage,
        TAREA: this.phase,
      };

      const response = await this._GetSurveyDataQuery.execute(objParam);
      if (!response) return;

      let dataResp = response.result[0];

      dataResp = {
        ...dataResp,
        ARCHIVO_ACTA_NAME: currentSurvey.dataSaved?.ARCHIVO_ACTA ?? '',
        ARCHIVO_EVIDENCIA_NAME: currentSurvey.dataSaved?.ARCHIVO_EVIDENCIA ?? ''
      }

      const info = dataResp?.DATOS_JSON;

      this.fillQuestionAnswer(dataResp, info);
    } catch (error) {
      if ((error as any)?.message) {
        console.error('Error al obtener los datos guardados:', (error as any)?.error?.message);
      }
    } finally {
      this.isLoading = false;
      this.isLoadingInformation.emit(false);
    }
  }
  fillQuestionAnswer(data: any, respuesta: any) {
    let objImplementacion: any = {
      fechaModalidad: data.FECHA_MODALIDAD,
      modalidad: data.MODALIDAD,
      tareaImplementada: data.REGISTRA_TAREA
    };
    this.tareaImplementada = data.REGISTRA_TAREA;
    this.question = data.REGISTRA_TAREA ? 1 : 3;
    let arrPreguntas: any = JSON.parse(respuesta);

    this.archivoName = null;
    if (data.REGISTRA_TAREA) {
      this.archivoName = {
        archivoActa: {
          name: data.ARCHIVO_ACTA && !data.ARCHIVO_ACTA_NAME ? "acta.pdf" : data.ARCHIVO_ACTA_NAME,
          file: data.ARCHIVO_ACTA
        },
        archivoFoto: {
          name: data.ARCHIVO_EVIDENCIA && !data.ARCHIVO_EVIDENCIA_NAME ? "evidencia.jpg" : data.ARCHIVO_EVIDENCIA_NAME,
          file: data.ARCHIVO_EVIDENCIA
        }
      };
    }
    if (Object.keys(arrPreguntas).length > 0) {
      this.objQuestion = {};
      arrPreguntas.map((pregunta: any) => {
        this.objQuestion[pregunta.question] = pregunta.answer;
      });
    }
    this._TemporalSaveService.setDataInformationImplementation(objImplementacion);
    this.isCompletePhase = true;
    //this.isUpdateEnable = !this.isAllStagesCompleted;
    // if(this.isUpdateEnable){
    //   this.archivoName = null;
    // }
  }

  private resetFormState() {
    this.objQuestion = null;
    this.archivoName = null;
    this.archivoActa = null;
    this.archivoFoto = null;
    this.isCompletePhase = false;
    this._TemporalSaveService.setDataInformationImplementation({
      fechaModalidad: null,
      modalidad: null,
      tareaImplementada: this.tareaImplementada
    });
    this._TemporalSaveService.saveCurrentQuestionTemp([]);
  }

  private ensureActiveStageYear(): '2026' {
    const enforcedYear: '2026' = '2026';
    if (getActiveStageYear() !== enforcedYear) {
      setActiveStageYear(enforcedYear);
    }
    return enforcedYear;
  }
}


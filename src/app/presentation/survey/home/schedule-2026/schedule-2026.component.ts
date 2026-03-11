import { ConfigSurvey } from '../../../../shared/constants/configs';

// Enum para los stages
export enum StageEnum {
  UNO = 1,
  DOS = 2,
  TRES = 3,
  CUATRO = 4,
  CINCO = 5,
  SEIS = 6,
  SIETE = 7,
  OCHO = 8,
  NUEVE = 9,
  DIEZ = 10
}
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-schedule-2026',
  imports: [CommonModule],
  templateUrl: './schedule-2026.component.html',
  styleUrl: './schedule-2026.component.css',
})
export class Schedule2026Component {
    formatDate(dateStr: string): string {
      if (!dateStr) return '';
      // Si el string tiene formato ISO, extrae los primeros 10 caracteres
      // Ejemplo: 2026-04-01T00:00:00.000Z => 2026-04-01
      const iso = dateStr.slice(0, 10);
      const [year, month, day] = iso.split('-');
      if (year && month && day) return `${year}/${month}/${day}`;
      return '';
    }
  @Output() selectedStage = new EventEmitter<any>();

  stages:any=[];
  public enableDates: any = {};
  private static readonly DISABLED_SURVEYS_BY_STAGE: Record<number, number[]> = {
    1: [5],
    4: [4,5],
  };

  constructor() {
   this.setStage();
  }

  getProgressBarStyle(stage_2026: any): string {
    if(!stage_2026.enable){
      return 'background: #e4e4e7';
    }

    const filSur= stage_2026.survey.filter((s: any) => s.enable && s);

    const completedPercentage = (filSur.filter((s: any) => s.complete && s).length / filSur.length) * 100;
    if (completedPercentage <= 0) {
      return 'background: #3b82f6';
    }
    return `background: linear-gradient(to right, #10b981 ${completedPercentage}%, #3b82f6 ${100 - completedPercentage}%);`;
  }

  selectStage(stage_2026: string | undefined, n: number | undefined) {
    if (!stage_2026) {
      return;
    }

    const [stageNumber, phaseNumber] = stage_2026.split('-');
    const objStage = {
      stage: stageNumber,
      phase: phaseNumber,
      countQuestion: n ?? 0,
      year: '2026'
    };
    this.selectedStage.emit(objStage);
  }

  setStage(){
    const savedStage = localStorage.getItem('stage');
    let cnfSchd = ConfigSurvey.SCHEDULE_CONFIG;
    let stagesData = savedStage ? JSON.parse(savedStage) : cnfSchd;

    // Asegura que cada stage tenga el número correcto de encuestas (survey)

    // Devuelve un objeto { [stage]: countSurvey }
    let countStage: Record<string, number> = {};
    cnfSchd.forEach((stage: any) => {
      const surveyCount = Array.isArray(stage.survey) ? stage.survey.length : 0;
      // Convertir el stage a enum si es posible
      let stageEnumValue = stage.stage;
      countStage[stageEnumValue] = surveyCount;
    });


    stagesData = stagesData.map((stage: any) => {
      const labelStage = (stage.labelStage || '').toLowerCase();
      const match = labelStage.match(/fase\s*(\d+)/i);
      const stageNumber = match ? Number(match[1]) : Number(stage.stage) || stage.labelStage;

      const stageConfig = cnfSchd.find((cfg: any) => cfg.stage === stageNumber);
      if (stageConfig) {
        stage.survey = stageConfig.survey.map((surveyCfg: any) => {
          const existingSurvey = Array.isArray(stage.survey)
            ? stage.survey.find((s: any) => s?.survey === surveyCfg.survey)
            : null;
          return {
            ...surveyCfg,
            ...(existingSurvey ?? {})
          };
        });
      } else if (countStage[stageNumber] !== undefined) {
        if (stage.survey.length !== countStage[stageNumber]) {
          stage.survey = Array.from({ length: countStage[stageNumber] }, (_, i) => stage.survey[i] || {});
        }
      }

      return {
        ...stage,
        stage: stageNumber
      };
    });

    stagesData = this.applyDisabledSurveys(stagesData);


    const saveStageEnable = localStorage.getItem('dataStageEnable');
    let enableDatesArr: any[] = [];
    if (saveStageEnable) {
      enableDatesArr = JSON.parse(saveStageEnable);
    }
    console.log('enableDatesArr', enableDatesArr);
    // Asignar fechas a cada stage
    stagesData = stagesData.map((stage: any) => {
      const found = enableDatesArr.find((e: any) => e.stage == stage.stage + 5);
      if (found) {
        return {
          ...stage,
          enableDates: {
            start: found.start,
            end: found.end
          }
        };
      }
      return {
        ...stage,
        enableDates: {}
      };
    });
    const shouldForceStageOne = enableDatesArr.length === 0;
    let stages = stagesData.map((stage: any) => {
      const found = enableDatesArr.find((e: any) => e.stage == stage.stage +5);
      if (found) {
        return {
          ...stage,
          enable:found.enable
        };
      }
      return {
        ...stage,
        enable: shouldForceStageOne ? stage.stage === 1 : false
      };
    });
    this.stages = Array.from(stages);
    localStorage.setItem('stage', JSON.stringify(this.stages));
  }

  refreshStage(){
    this.stages=[];
    this.setStage();
  }

  private applyDisabledSurveys(stages: any[]): any[] {
    return stages.map((stage: any) => {
      const disabledTasks = Schedule2026Component.DISABLED_SURVEYS_BY_STAGE[Number(stage.stage)] ?? [];
      if (!disabledTasks.length || !Array.isArray(stage.survey)) {
        return stage;
      }

      const updatedSurvey = stage.survey.map((survey: any) => {
        const surveyId = typeof survey?.survey === 'string' ? survey.survey : '';
        const [, taskSegment] = surveyId.split('-');
        const taskNumber = Number(taskSegment);
        if (!taskSegment || !disabledTasks.includes(taskNumber)) {
          return survey;
        }

        return {
          ...survey,
          enable: false,
          prevComplete: false,
          complete: false
        };
      });

      return {
        ...stage,
        survey: updatedSurvey
      };
    });
  }
}

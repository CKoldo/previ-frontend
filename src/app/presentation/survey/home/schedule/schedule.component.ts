import { ConfigSurvey } from './../../../../shared/constants/configs';

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
  selector: 'app-schedule',
  imports: [CommonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})
export class ScheduleComponent {
  @Output() selectedStage = new EventEmitter<any>();

  stages:any=[];

  constructor() {
   this.setStage();
  }

  getProgressBarStyle(stage: any): string {
    if(!stage.enable){
      return 'background: #e4e4e7';
    }

    const filSur= stage.survey.filter((s: any) => s.enable && s);

    const completedPercentage = (filSur.filter((s: any) => s.complete && s).length / filSur.length) * 100;
    if (completedPercentage <= 0) {
      return 'background: #3b82f6';
    }
    return `background: linear-gradient(to right, #10b981 ${completedPercentage}%, #3b82f6 ${100 - completedPercentage}%);`;
  }

  selectStage(stage: string | undefined, n: number | undefined) {
    if (!stage) {
      return;
    }

    const [stageNumber, phaseNumber] = stage.split('-');
    const objStage = {
      stage: stageNumber,
      phase: phaseNumber,
      countQuestion: n ?? 0,
      year: '2025'
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


    const saveStageEnable = localStorage.getItem('dataStageEnable');
    let enableDates: any[] = [];
    if (saveStageEnable) {
      enableDates = JSON.parse(saveStageEnable);
    }
    //console.log('enableDates:', enableDates);
    let stages = stagesData.map((stage: any) => {

      const found = enableDates.find((e: any) => e.stage == stage.stage);
      if (found) {

        return {
          ...stage,
          enable:found.enable
        };
      }
      return {
        ...stage,
        enable: false
      };
    });
    this.stages = Array.from(stages);
    localStorage.setItem('stage', JSON.stringify(this.stages));
  }

  refreshStage(){
    this.stages=[];
    this.setStage();
  }
}

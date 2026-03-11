import { Injectable } from "@angular/core";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import { SaveStagePhaseCommand } from "./save-stage-phase.command";
import { SurveyData } from "app/domain/survey/survey.model";

@Injectable({
  providedIn: 'root'
})
export class SaveStagePhaseHandler implements SaveStagePhaseCommand{
  constructor(private _surveyRepository:ISurveyRepository){}

  public execute(params:SurveyData):Promise<any>{
    return this._surveyRepository.saveStagePhase(params);
  }

}

import { Injectable } from "@angular/core";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import { SurveyData } from "app/domain/survey/survey.model";
import { UpdateStagePhaseCommand } from "./update-stage-phase.command";

@Injectable({
  providedIn: 'root'
})
export class UpdateStagePhaseHandler implements UpdateStagePhaseCommand{
  constructor(private _surveyRepository:ISurveyRepository){}

  public execute(params:SurveyData):Promise<any>{
    return this._surveyRepository.updateStagePhase(params);
  }

}

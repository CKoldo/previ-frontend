import { Injectable } from "@angular/core";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import { SaveConfigurationCommand } from "./save-configuration.command";
import { SurveyConfiguration } from "app/domain/survey/survey.model";


@Injectable({
  providedIn: 'root'
})
export class SaveConfigurationHandler implements SaveConfigurationCommand{
  constructor(private _surveyRepository:ISurveyRepository){}

  public execute(params:SurveyConfiguration):Promise<any>{
    return this._surveyRepository.saveConfiguration(params);
  }

}

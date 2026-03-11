import { Injectable } from "@angular/core";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import { SurveyConfiguration } from "app/domain/survey/survey.model";
import { UpdateConfigurationCommand } from "./update-configuration.command";


@Injectable({
  providedIn: 'root'
})
export class UpdateConfigurationHandler implements UpdateConfigurationCommand{
  constructor(private _surveyRepository:ISurveyRepository){}

  public execute(params:SurveyConfiguration):Promise<any>{
    return this._surveyRepository.updateConfiguration(params);
  }

}

import { Injectable } from "@angular/core";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import {  SurveyDataInfo } from "app/domain/survey/survey.model";
import { GetSurveyDataQuery } from "./get-survey-data.query";


@Injectable({
  providedIn: 'root'
})
export class GetSurveyDataHandler implements GetSurveyDataQuery{
  constructor(private _surveyRepository:ISurveyRepository){}

  public execute(params:SurveyDataInfo):Promise<any>{
    return this._surveyRepository.getSurveyData(params);
  }

}

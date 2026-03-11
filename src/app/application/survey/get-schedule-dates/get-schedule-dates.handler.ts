import { Injectable } from "@angular/core";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import { GetScheduleDatesQuery } from "./get-schedule-dates.query";

@Injectable({
  providedIn: 'root'
})
export class GetScheduleDatesHandler implements GetScheduleDatesQuery{
  constructor(private _surveyRepository:ISurveyRepository){}

  public execute():Promise<any>{
    return this._surveyRepository.getScheduleDates();
  }

}

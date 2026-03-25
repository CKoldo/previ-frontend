import { Injectable } from "@angular/core";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import { ScheduleDateEntry } from "app/domain/survey/survey.model";
import { GetScheduleDatesQuery } from "./get-schedule-dates.query";

@Injectable({
  providedIn: 'root'
})
export class GetScheduleDatesHandler implements GetScheduleDatesQuery{
  constructor(private _surveyRepository:ISurveyRepository){}

  public execute():Promise<ScheduleDateEntry[]>{
    return this._surveyRepository.getScheduleDates();
  }

}

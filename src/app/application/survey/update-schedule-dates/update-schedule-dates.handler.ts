import { Injectable } from "@angular/core";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import { UpdateScheduleDatesCommand } from "./update-schedule-dates.command";
import { ScheduleDateUpdate } from "app/domain/survey/survey.model";

@Injectable({
  providedIn: 'root'
})
export class UpdateScheduleDatesHandler implements UpdateScheduleDatesCommand {
  constructor(private readonly _surveyRepository: ISurveyRepository) {}

  execute(params: ScheduleDateUpdate): Promise<any> {
    return this._surveyRepository.updateScheduleDates(params);
  }
}

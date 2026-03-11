import { Injectable } from "@angular/core";
import { ReportEntryData } from "app/domain/survey/survey.model";
import { ISurveyRepository } from "app/domain/survey/survey.repository";
import { GenerateReportCommand } from "./generate-report.command";

@Injectable({
  providedIn: 'root'
})
export class GenerateReportHandler implements GenerateReportCommand{
  constructor(private _surveyRepository:ISurveyRepository){}

  public execute(params:ReportEntryData):Promise<any>{
    return this._surveyRepository.generateReport(params);
  }

}
